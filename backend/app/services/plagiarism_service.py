import asyncio
import math
import time
import uuid
from typing import Dict, Any, List

from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.messages import HumanMessage
import google.generativeai as genai

from app.services.research_service import ResearchService
from app.core.config import GOOGLE_API_KEY

# Configure genai for embeddings
if GOOGLE_API_KEY:
    genai.configure(api_key=GOOGLE_API_KEY)


def cosine_similarity(a: List[float], b: List[float]) -> float:
    """Compute cosine similarity between two vectors."""
    dot = sum(x * y for x, y in zip(a, b))
    norm_a = math.sqrt(sum(x * x for x in a))
    norm_b = math.sqrt(sum(x * x for x in b))
    if norm_a == 0 or norm_b == 0:
        return 0.0
    return dot / (norm_a * norm_b)


class PlagiarismService:
    def __init__(self, research_service: ResearchService):
        self.research_service = research_service
        self.llm = ChatGoogleGenerativeAI(
            model="gemini-2.0-flash",
            google_api_key=GOOGLE_API_KEY,
            temperature=0.1,
        )
        self.jobs_db: Dict[str, Any] = {}

    # =========================================================================
    # Job Management
    # =========================================================================
    def start_job(self, content: str) -> str:
        job_id = str(uuid.uuid4())
        self.jobs_db[job_id] = {
            "id": job_id,
            "status": "pending",
            "progress": 0,
            "submitted_at": time.time(),
        }
        return job_id

    def get_job_status(self, job_id: str) -> Dict[str, Any]:
        return self.jobs_db.get(job_id)

    # =========================================================================
    # Main Processing Pipeline
    # =========================================================================
    async def process_plagiarism_job(self, job_id: str, content: str):
        """Run all three analysis phases in sequence."""
        try:
            self.jobs_db[job_id]["status"] = "processing"

            # Extract paragraphs for analysis
            paragraphs = [p.strip() for p in content.split("\n\n") if len(p.strip()) > 80]
            sentences = [s.strip() for s in content.split(".") if len(s.strip()) > 50][:12]

            # Phase 1: AI Detection (0-30%)
            self.jobs_db[job_id]["progress"] = 5
            ai_result = await self._detect_ai(paragraphs[:6])
            self.jobs_db[job_id]["progress"] = 30

            # Phase 2: Semantic Similarity (30-70%)
            semantic_result = await self._check_semantic_similarity(
                paragraphs[:5], sentences[:8], job_id
            )
            self.jobs_db[job_id]["progress"] = 70

            # Phase 3: Paraphrase Detection (70-100%)
            paraphrase_result = await self._detect_paraphrases(
                sentences[:8], job_id
            )
            self.jobs_db[job_id]["progress"] = 95

            # Compute overall score (weighted average)
            overall_score = round(
                ai_result["score"] * 0.4
                + semantic_result["score"] * 0.35
                + paraphrase_result["score"] * 0.25,
                1,
            )
            overall_status = (
                "low" if overall_score < 25
                else "medium" if overall_score < 55
                else "high"
            )

            # Collect all matched sources for backward compat
            all_sources = []
            for s in semantic_result.get("similar_sources", []):
                all_sources.append({
                    "url": s["url"],
                    "title": s["title"],
                    "matched_text": s.get("matched_concept", ""),
                })
            for p in paraphrase_result.get("flagged_passages", []):
                if p.get("source_url"):
                    all_sources.append({
                        "url": p["source_url"],
                        "title": p.get("source_title", ""),
                        "matched_text": p.get("paper_text", "")[:100],
                    })

            self.jobs_db[job_id]["result"] = {
                "ai_detection": ai_result,
                "semantic_similarity": semantic_result,
                "paraphrase_detection": paraphrase_result,
                "overall_score": overall_score,
                "overall_status": overall_status,
                # backward compat fields
                "similarity_score": overall_score,
                "status": overall_status,
                "checked_sentences": len(sentences),
                "matches_found": len(all_sources),
                "matched_sources": all_sources[:10],
            }
            self.jobs_db[job_id]["status"] = "completed"
            self.jobs_db[job_id]["progress"] = 100

        except Exception as e:
            print(f"Job {job_id} failed: {e}")
            import traceback
            traceback.print_exc()
            self.jobs_db[job_id]["status"] = "error"
            self.jobs_db[job_id]["error"] = str(e)

    # =========================================================================
    # Phase 1: AI Detection
    # =========================================================================
    async def _detect_ai(self, paragraphs: List[str]) -> Dict[str, Any]:
        """Use Gemini to analyze text for AI-generation patterns."""
        if not paragraphs:
            return {"score": 0, "status": "low", "reasoning": "No content to analyze.", "indicators": []}

        sample_text = "\n\n".join(paragraphs[:5])

        prompt = f"""You are an expert AI content detector. Analyze the following text and determine the likelihood it was generated by an AI language model.

Look for these indicators:
1. Uniform sentence structure and rhythm
2. Lack of personal voice, anecdotes, or unique perspective
3. Overly smooth transitions between ideas
4. Generic phrasing and hedging language ("it is important to note", "furthermore", "in conclusion")
5. Predictable paragraph structure (topic sentence → evidence → conclusion)
6. Lack of specific data, citations with page numbers, or firsthand observations
7. Unusually broad coverage without deep expertise in any area
8. Perfect grammar with no colloquialisms or informal language

TEXT TO ANALYZE:
\"\"\"
{sample_text[:3000]}
\"\"\"

Return ONLY a JSON object (no code fences, no markdown):
{{
    "score": <0-100 integer, likelihood of AI generation>,
    "reasoning": "<2-3 sentence explanation>",
    "indicators": ["<indicator 1>", "<indicator 2>", "<indicator 3>"]
}}"""

        try:
            loop = asyncio.get_event_loop()
            response = await asyncio.wait_for(
                loop.run_in_executor(
                    None, lambda: self.llm.invoke([HumanMessage(content=prompt)])
                ),
                timeout=45,
            )
            text = response.content.strip()
            # Parse JSON
            import json, re
            text = re.sub(r"^```(?:json)?\s*", "", text)
            text = re.sub(r"\s*```$", "", text)
            start = text.find("{")
            end = text.rfind("}") + 1
            if start != -1 and end > start:
                data = json.loads(text[start:end])
                score = min(max(int(data.get("score", 0)), 0), 100)
                return {
                    "score": score,
                    "status": "low" if score < 25 else "medium" if score < 55 else "high",
                    "reasoning": data.get("reasoning", "Analysis complete."),
                    "indicators": data.get("indicators", [])[:5],
                }
        except Exception as e:
            print(f"AI detection error: {e}")

        return {"score": 0, "status": "low", "reasoning": "Analysis could not be completed.", "indicators": []}

    # =========================================================================
    # Phase 2: Semantic Similarity
    # =========================================================================
    async def _check_semantic_similarity(
        self, paragraphs: List[str], sentences: List[str], job_id: str
    ) -> Dict[str, Any]:
        """Embed paper content and web results, compute cosine similarity."""
        if not paragraphs:
            return {"score": 0, "status": "low", "similar_sources": []}

        similar_sources = []
        all_similarities = []  # Track every similarity score for averaging
        max_similarity = 0.0

        # Extract key topics from first few sentences for search
        search_queries = []
        for s in sentences[:4]:
            query = s[:80].strip()
            if query:
                search_queries.append(query)

        print(f"[Semantic] Starting with {len(search_queries)} search queries")

        loop = asyncio.get_event_loop()

        for i, query in enumerate(search_queries):
            self.jobs_db[job_id]["progress"] = 30 + int((i / max(len(search_queries), 1)) * 35)

            try:
                # Run synchronous search in executor to avoid blocking
                results = await loop.run_in_executor(
                    None, lambda q=query: self.research_service.search_web(q, max_results=3)
                )
                print(f"[Semantic] Query {i+1}: '{query[:40]}...' -> {len(results)} results")
                if not results:
                    continue

                # Embed the paper paragraph
                paper_chunk = paragraphs[min(i, len(paragraphs) - 1)][:500]
                paper_embedding = await loop.run_in_executor(
                    None, lambda: genai.embed_content(
                        model="models/text-embedding-004",
                        content=paper_chunk,
                    )["embedding"]
                )

                for r in results:
                    web_text = r.get("content", "")[:500]
                    if len(web_text) < 50:
                        continue

                    web_embedding = await loop.run_in_executor(
                        None, lambda wt=web_text: genai.embed_content(
                            model="models/text-embedding-004",
                            content=wt,
                        )["embedding"]
                    )

                    sim = cosine_similarity(paper_embedding, web_embedding)
                    all_similarities.append(sim)
                    print(f"[Semantic]   -> {r.get('title', '')[:50]}: similarity={sim:.3f}")

                    if sim > 0.55:  # Lowered threshold for meaningful similarity
                        similar_sources.append({
                            "url": r.get("url", ""),
                            "title": r.get("title", ""),
                            "similarity": round(sim * 100, 1),
                            "matched_concept": web_text[:150] + "...",
                        })
                        max_similarity = max(max_similarity, sim)

                await asyncio.sleep(0.3)
            except Exception as e:
                print(f"[Semantic] ERROR for query '{query[:30]}': {e}")
                import traceback; traceback.print_exc()
                continue

        # Score: use average of all similarity scores as a baseline,
        # then boost based on number of matches above threshold
        if all_similarities:
            avg_sim = sum(all_similarities) / len(all_similarities)
            base_score = round(avg_sim * 100, 1)
            # Boost for each source that crossed threshold
            boost = min(len(similar_sources) * 5, 25)
            score = min(round(base_score + boost, 1), 100)
        else:
            score = 0

        print(f"[Semantic] Final: {len(similar_sources)} sources, score={score}")

        return {
            "score": score,
            "status": "low" if score < 25 else "medium" if score < 55 else "high",
            "similar_sources": sorted(similar_sources, key=lambda x: x["similarity"], reverse=True)[:8],
        }

    # =========================================================================
    # Phase 3: Paraphrase Detection
    # =========================================================================
    async def _detect_paraphrases(
        self, sentences: List[str], job_id: str
    ) -> Dict[str, Any]:
        """Search for similar content online and use LLM to detect paraphrasing."""
        if not sentences:
            return {"score": 0, "status": "low", "flagged_passages": []}

        flagged_passages = []
        queries_with_results = 0
        total_comparisons = 0

        loop = asyncio.get_event_loop()
        print(f"[Paraphrase] Starting with {len(sentences[:6])} sentences")

        # Search for key sentences WITHOUT quotes (finds paraphrased/similar content)
        for i, sentence in enumerate(sentences[:6]):
            self.jobs_db[job_id]["progress"] = 70 + int((i / 6) * 25)

            try:
                results = await loop.run_in_executor(
                    None, lambda s=sentence: self.research_service.search_web(s[:100], max_results=2)
                )
                print(f"[Paraphrase] Sentence {i+1}: '{sentence[:40]}...' -> {len(results)} results")
                if not results:
                    continue
                queries_with_results += 1

                # Ask LLM to compare
                for r in results:
                    web_text = r.get("content", "")[:400]
                    if len(web_text) < 50:
                        continue
                    total_comparisons += 1

                    compare_prompt = f"""Compare these two texts and determine if the first is a paraphrase or derivative of the second. Be generous in detection — if the ideas are substantially similar even with different wording, that counts.

PAPER TEXT: "{sentence[:200]}"

WEB SOURCE: "{web_text[:300]}"

Return ONLY a JSON object (no code fences):
{{
    "is_paraphrase": true or false,
    "confidence": <0.0 to 1.0>,
    "explanation": "<one sentence>"
}}"""

                    try:
                        response = await asyncio.wait_for(
                            loop.run_in_executor(
                                None, lambda p=compare_prompt: self.llm.invoke([HumanMessage(content=p)])
                            ),
                            timeout=20,
                        )
                        text = response.content.strip()
                        import json, re
                        text = re.sub(r"^```(?:json)?\s*", "", text)
                        text = re.sub(r"\s*```$", "", text)
                        start_idx = text.find("{")
                        end_idx = text.rfind("}") + 1
                        if start_idx != -1 and end_idx > start_idx:
                            data = json.loads(text[start_idx:end_idx])
                            conf = float(data.get("confidence", 0))
                            is_para = data.get("is_paraphrase", False)
                            print(f"[Paraphrase]   -> {r.get('title', '')[:40]}: is_paraphrase={is_para}, confidence={conf:.2f}")
                            if is_para and conf > 0.4:  # Lowered from 0.6
                                flagged_passages.append({
                                    "paper_text": sentence[:150] + "...",
                                    "source_text": web_text[:150] + "...",
                                    "source_url": r.get("url", ""),
                                    "source_title": r.get("title", ""),
                                    "confidence": round(conf * 100),
                                })
                    except asyncio.TimeoutError:
                        print(f"[Paraphrase]   -> LLM comparison timed out")
                    except Exception as inner_e:
                        print(f"[Paraphrase]   -> LLM comparison error: {inner_e}")

                await asyncio.sleep(0.3)
            except Exception as e:
                print(f"[Paraphrase] ERROR for sentence {i+1}: {e}")
                import traceback; traceback.print_exc()
                continue

        # Score: base from how many queries returned results + flagged passages
        if total_comparisons > 0:
            base_score = round((queries_with_results / max(len(sentences[:6]), 1)) * 30, 1)
            flag_score = round((len(flagged_passages) / max(total_comparisons, 1)) * 70, 1)
            score = min(round(base_score + flag_score, 1), 100)
        else:
            score = 0

        print(f"[Paraphrase] Final: {len(flagged_passages)} flagged, {queries_with_results}/{len(sentences[:6])} had results, score={score}")

        return {
            "score": score,
            "status": "low" if score < 20 else "medium" if score < 50 else "high",
            "flagged_passages": flagged_passages[:8],
        }

    # =========================================================================
    # Sync check (kept for backward compat with /check endpoint)
    # =========================================================================
    def check_plagiarism_sync(self, content: str) -> dict:
        """Simple synchronous check — delegates to the old logic."""
        sentences = [s.strip() for s in content.split(".") if len(s.strip()) > 50][:5]
        total_matches = 0
        matched_sources = []

        for sentence in sentences:
            results = self.research_service.search_web(f'"{sentence[:100]}"', max_results=3)
            if results:
                total_matches += 1
                for r in results:
                    if r["url"] not in [m["url"] for m in matched_sources]:
                        matched_sources.append({
                            "url": r["url"],
                            "title": r["title"],
                            "matched_text": str(sentence[:100]) + "...",
                        })

        similarity_score = min((total_matches / max(len(sentences), 1)) * 100, 100)
        return {
            "similarity_score": round(similarity_score, 2),
            "checked_sentences": len(sentences),
            "matches_found": total_matches,
            "matched_sources": matched_sources[:5],
            "status": "low" if similarity_score < 20 else "medium" if similarity_score < 50 else "high",
        }


# Singleton
plagiarism_service_instance = None


def get_plagiarism_service_instance(research_service: ResearchService):
    global plagiarism_service_instance
    if plagiarism_service_instance is None:
        plagiarism_service_instance = PlagiarismService(research_service)
    return plagiarism_service_instance
