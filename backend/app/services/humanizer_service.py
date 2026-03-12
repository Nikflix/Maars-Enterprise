import asyncio
import re
import time
import uuid
from typing import Dict, Any, List

from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.messages import HumanMessage

from app.core.config import GOOGLE_API_KEY

HUMANIZE_SYSTEM_PROMPT = """You are an expert academic writing humanizer. Your sole job is to rewrite AI-generated research paper text so it reads as authentically human-written academic prose. You do NOT summarize, shorten, or change the meaning. You rewrite at the sentence and paragraph level only.

WHAT DETECTORS FLAG (avoid all of these):
- Uniform sentence length (every sentence ~20-25 words)
- Predictable paragraph structure (topic sentence → 3 supports → transition)
- Overly smooth transitions ("Furthermore", "Moreover", "In addition", "Additionally")
- Generic phrasing with no author voice
- No uncertainty, hedging, or intellectual tension
- No specific data, numbers, or cited observations
- Perfect logical flow with no digressions

YOUR REWRITING RULES:

1. SENTENCE VARIATION (most important)
   - Mix very short sentences (4-8 words) with long complex ones (35-50 words)
   - Break compound sentences apart randomly. Merge simple ones unexpectedly.
   - Target: no two consecutive sentences should be similar in length or structure

2. KILL SMOOTH TRANSITIONS
   - Remove: Furthermore, Moreover, Additionally, In addition, It is worth noting, It is important to, This suggests that
   - Replace with abrupt pivots, colons, dashes, or just start the next thought directly
   - Occasionally start a paragraph mid-thought as if continuing from prior reasoning

3. INJECT AUTHOR VOICE & HEDGING
   - Add phrases like: "curiously", "this remains poorly understood", "the evidence here is mixed", "we were surprised to find", "one interpretation — though not the only one —", "this may partially explain"
   - Make the author sound like they have opinions and encountered friction

4. BURSTINESS
   - Some paragraphs should be dense and technical. Others should be short, almost blunt.
   - Vary rhythm: don't let 3+ paragraphs in a row have the same energy or length

5. STRUCTURAL IRREGULARITY
   - Occasionally place a caveat or limitation mid-argument rather than at the end
   - Let one paragraph end without a clean wrap-up sentence
   - Add a brief methodological aside or a "this is outside the scope of this paper but worth noting" moment

6. DISCIPLINE-AUTHENTIC LANGUAGE
   - Use field-specific phrasing, abbreviations, and constructions that feel like they came from someone deep in the subject
   - Reference the kind of specific detail only a practitioner would mention (even hypothetically)

7. NEVER:
   - Change citations, data, numbers, or findings
   - Summarize instead of rewrite
   - Make the text shorter
   - Use casual or non-academic language
   - Add content that wasn't in the original

OUTPUT:
Return only the rewritten text. No explanations, no commentary, no labels. Just the rewritten paper section ready to use. Keep ALL markdown formatting exactly as-is (##, ###, **bold**, lists, etc.)."""


class HumanizerService:
    def __init__(self):
        self.llm = ChatGoogleGenerativeAI(
            model="gemini-2.0-flash",
            google_api_key=GOOGLE_API_KEY,
            temperature=0.9,  # High creativity for maximum variation
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
    # Section Splitting
    # =========================================================================
    def _split_into_sections(self, content: str) -> List[Dict[str, str]]:
        """Split paper content into sections by ## headers."""
        sections = []
        # Split on markdown ## headers (keep the header with its content)
        parts = re.split(r'(^#{1,3}\s+.+$)', content, flags=re.MULTILINE)

        current_header = ""
        current_body = ""

        for part in parts:
            if re.match(r'^#{1,3}\s+', part):
                # Save previous section if it exists
                if current_header or current_body.strip():
                    sections.append({
                        "header": current_header,
                        "body": current_body.strip(),
                    })
                current_header = part.strip()
                current_body = ""
            else:
                current_body += part

        # Save the last section
        if current_header or current_body.strip():
            sections.append({
                "header": current_header,
                "body": current_body.strip(),
            })

        return sections

    # =========================================================================
    # Main Processing Pipeline
    # =========================================================================
    async def process_humanize_job(self, job_id: str, content: str):
        """Rewrite paper content section-by-section to sound human-written."""
        try:
            self.jobs_db[job_id]["status"] = "processing"
            self.jobs_db[job_id]["progress"] = 5

            sections = self._split_into_sections(content)
            total_sections = max(len(sections), 1)
            humanized_sections = []

            print(f"[Humanizer] Starting: {total_sections} sections to process")

            for i, section in enumerate(sections):
                progress = 5 + int((i / total_sections) * 90)
                self.jobs_db[job_id]["progress"] = progress

                header = section["header"]
                body = section["body"]

                # Skip empty sections or very short ones
                if len(body) < 30:
                    humanized_sections.append(
                        f"{header}\n\n{body}" if header else body
                    )
                    print(f"[Humanizer] Section {i+1}/{total_sections}: '{header[:40]}' — skipped (too short)")
                    continue

                # Build the section text to humanize
                section_text = f"{header}\n\n{body}" if header else body

                prompt = f"""{HUMANIZE_SYSTEM_PROMPT}

CRITICAL EXTRA INSTRUCTIONS:
- You MUST drastically vary sentence lengths. Some sentences should be 5-8 words. Others 40+ words.
- Replace at least 30% of the vocabulary with synonyms or rephrasings.
- Add at least 2 hedging phrases per paragraph ("arguably", "it seems", "one could contend", "this is debatable").
- Insert at least one rhetorical question or self-correction per section.
- Break predictable paragraph patterns: start some paragraphs with a dependent clause, a question, or a single-word emphasis.

TEXT TO HUMANIZE:
\"\"\"
{section_text}
\"\"\""""

                try:
                    loop = asyncio.get_event_loop()
                    response = await asyncio.wait_for(
                        loop.run_in_executor(
                            None, lambda p=prompt: self.llm.invoke([HumanMessage(content=p)])
                        ),
                        timeout=120,
                    )
                    rewritten = response.content.strip()

                    # Remove any code fences the LLM might add
                    rewritten = re.sub(r'^```(?:markdown)?\s*', '', rewritten)
                    rewritten = re.sub(r'\s*```$', '', rewritten)

                    # Sanity check: if rewritten is way too short, keep original
                    if len(rewritten) < len(section_text) * 0.4:
                        print(f"[Humanizer] Section {i+1}/{total_sections}: '{header[:40]}' — rewrite too short, keeping original")
                        humanized_sections.append(section_text)
                    else:
                        # Second pass: quick polish to catch remaining AI-sounding phrases
                        polish_prompt = f"""Rewrite the following academic text ONE MORE TIME. Your ONLY goal is to eliminate any remaining AI-sounding patterns.
Specifically: replace any instances of "Furthermore", "Moreover", "It is important to note", "In conclusion", "Additionally" with natural alternatives or remove them. Vary sentence openings. Keep all meaning, data, and markdown formatting intact.
Return ONLY the rewritten text, nothing else.

\"\"\"
{rewritten}
\"\"\""""
                        try:
                            response2 = await asyncio.wait_for(
                                loop.run_in_executor(
                                    None, lambda p=polish_prompt: self.llm.invoke([HumanMessage(content=p)])
                                ),
                                timeout=90,
                            )
                            polished = response2.content.strip()
                            polished = re.sub(r'^```(?:markdown)?\s*', '', polished)
                            polished = re.sub(r'\s*```$', '', polished)
                            if len(polished) >= len(rewritten) * 0.5:
                                rewritten = polished
                                print(f"[Humanizer] Section {i+1}/{total_sections}: '{header[:40]}' — polish pass done")
                        except Exception:
                            pass  # Keep first-pass result if polish fails

                        humanized_sections.append(rewritten)
                        print(f"[Humanizer] Section {i+1}/{total_sections}: '{header[:40]}' — done ({len(section_text)} → {len(rewritten)} chars)")

                except asyncio.TimeoutError:
                    print(f"[Humanizer] Section {i+1}/{total_sections}: '{header[:40]}' — TIMEOUT, keeping original")
                    humanized_sections.append(section_text)
                except Exception as e:
                    print(f"[Humanizer] Section {i+1}/{total_sections}: '{header[:40]}' — ERROR: {e}")
                    humanized_sections.append(section_text)

                # Small delay between sections to avoid rate limiting
                await asyncio.sleep(0.5)

            # Join all sections back together
            humanized_content = "\n\n".join(humanized_sections)

            self.jobs_db[job_id]["result"] = {
                "humanized_content": humanized_content,
                "sections_processed": total_sections,
                "original_length": len(content),
                "humanized_length": len(humanized_content),
            }
            self.jobs_db[job_id]["status"] = "completed"
            self.jobs_db[job_id]["progress"] = 100
            print(f"[Humanizer] Complete: {total_sections} sections, {len(content)} → {len(humanized_content)} chars")

        except Exception as e:
            print(f"[Humanizer] Job {job_id} failed: {e}")
            import traceback
            traceback.print_exc()
            self.jobs_db[job_id]["status"] = "error"
            self.jobs_db[job_id]["error"] = str(e)

    # =========================================================================
    # Targeted Fix Based on Analysis Report
    # =========================================================================
    async def process_fix_job(self, job_id: str, content: str, analysis: str, indicators: list):
        """Rewrite paper content to specifically fix the issues identified by the AI detector."""
        try:
            self.jobs_db[job_id]["status"] = "processing"
            self.jobs_db[job_id]["progress"] = 5

            indicators_text = "\n".join(f"- {ind}" for ind in indicators)

            fix_prompt = f"""You are an expert academic writing editor. An AI content detector has analyzed the following paper and flagged specific issues. Your job is to rewrite the ENTIRE paper to specifically eliminate each flagged issue while preserving all meaning, data, citations, and markdown formatting.

AI DETECTOR'S ANALYSIS:
"{analysis}"

SPECIFIC ISSUES TO FIX:
{indicators_text}

REWRITING STRATEGY FOR EACH ISSUE:

1. "Uniform sentence structure and rhythm" → Drastically vary sentence lengths. Use very short sentences (4-8 words) mixed with long complex ones (35-50 words). No two consecutive sentences should have similar length.

2. "Overly smooth transitions between ideas" → Remove ALL instances of: Furthermore, Moreover, Additionally, In addition, It is worth noting, Consequently, Therefore, Thus, Hence. Replace with abrupt pivots, colons, em-dashes, or simply start the next thought directly without any connecting word.

3. "Generic phrasing and hedging language" → Replace generic phrases with specific, discipline-authentic language. Instead of "it is important to note", use direct assertions. Instead of "various studies have shown", cite specifics or use "the data suggests" or "Smith's 2019 work demonstrated".

4. "Predictable paragraph structure" → Break the topic-sentence → evidence → conclusion pattern. Start some paragraphs mid-thought, place caveats in the middle of arguments, end some paragraphs without a wrap-up.

5. "Lack of personal voice" → Add authorial opinion: "curiously", "we were struck by", "this remains puzzling", "one interpretation — though contested —". Make it sound like a human researcher who has thoughts and encounters friction.

6. "Perfect grammar with no colloquialisms" → Introduce occasional parenthetical asides, self-corrections ("or rather,"), and rhetorical questions.

RULES:
- Do NOT change any citations, data, numbers, or factual claims
- Do NOT summarize or shorten the text
- Do NOT add new content that wasn't in the original
- Keep ALL markdown formatting exactly as-is (##, ###, **bold**, lists, etc.)
- The output must be the COMPLETE rewritten paper

TEXT TO FIX:
\"\"\"
{content}
\"\"\"

Return ONLY the rewritten paper. No explanations, no commentary."""

            sections = self._split_into_sections(content)
            total_sections = max(len(sections), 1)
            fixed_sections = []

            for i, section in enumerate(sections):
                progress = 5 + int((i / total_sections) * 90)
                self.jobs_db[job_id]["progress"] = progress

                header = section["header"]
                body = section["body"]

                if len(body) < 30:
                    fixed_sections.append(f"{header}\n\n{body}" if header else body)
                    continue

                section_text = f"{header}\n\n{body}" if header else body

                section_prompt = f"""You are an expert academic writing editor. An AI content detector flagged these specific issues:

ISSUES TO FIX:
{indicators_text}

ANALYSIS: "{analysis}"

Rewrite this section to specifically eliminate these issues. Vary sentence lengths dramatically, remove smooth transitions, add author voice, break predictable patterns. Keep all data, citations, and markdown formatting intact.

SECTION TO FIX:
\"\"\"
{section_text}
\"\"\"

Return ONLY the rewritten section text."""

                try:
                    loop = asyncio.get_event_loop()
                    response = await asyncio.wait_for(
                        loop.run_in_executor(
                            None, lambda p=section_prompt: self.llm.invoke([HumanMessage(content=p)])
                        ),
                        timeout=120,
                    )
                    rewritten = response.content.strip()
                    rewritten = re.sub(r'^```(?:markdown)?\s*', '', rewritten)
                    rewritten = re.sub(r'\s*```$', '', rewritten)

                    if len(rewritten) < len(section_text) * 0.4:
                        fixed_sections.append(section_text)
                    else:
                        fixed_sections.append(rewritten)
                        print(f"[Fixer] Section {i+1}/{total_sections}: '{header[:40]}' — fixed")

                except Exception as e:
                    print(f"[Fixer] Section {i+1}/{total_sections} error: {e}")
                    fixed_sections.append(section_text)

                await asyncio.sleep(0.5)

            fixed_content = "\n\n".join(fixed_sections)

            self.jobs_db[job_id]["result"] = {
                "humanized_content": fixed_content,
                "sections_processed": total_sections,
                "original_length": len(content),
                "humanized_length": len(fixed_content),
            }
            self.jobs_db[job_id]["status"] = "completed"
            self.jobs_db[job_id]["progress"] = 100
            print(f"[Fixer] Complete: {total_sections} sections fixed")

        except Exception as e:
            print(f"[Fixer] Job {job_id} failed: {e}")
            import traceback
            traceback.print_exc()
            self.jobs_db[job_id]["status"] = "error"
            self.jobs_db[job_id]["error"] = str(e)



# Singleton
_humanizer_instance = None


def get_humanizer_service_instance():
    global _humanizer_instance
    if _humanizer_instance is None:
        _humanizer_instance = HumanizerService()
    return _humanizer_instance
