import json
import re
import asyncio
from typing import Dict, Any, List

from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.messages import HumanMessage
from tavily import TavilyClient

from app.core.config import GOOGLE_API_KEY, TAVILY_API_KEY

class ResearchService:
    def __init__(self):
        self.llm = ChatGoogleGenerativeAI(model="gemini-2.0-flash", google_api_key=GOOGLE_API_KEY, temperature=0.3)
        self.tavily_client = TavilyClient(api_key=TAVILY_API_KEY)

    async def invoke_llm_with_timeout(self, prompt: str, timeout_seconds: int = 60, max_retries: int = 2) -> str:
        """Invoke LLM with a timeout and automatic retries to prevent hanging."""
        last_error = None
        for attempt in range(max_retries + 1):
            try:
                loop = asyncio.get_event_loop()
                response = await asyncio.wait_for(
                    loop.run_in_executor(None, lambda: self.llm.invoke([HumanMessage(content=prompt)])),
                    timeout=timeout_seconds
                )
                return response.content.strip()
            except asyncio.TimeoutError:
                last_error = TimeoutError(f"LLM call timed out after {timeout_seconds}s (attempt {attempt + 1}/{max_retries + 1})")
                print(f"WARNING: {last_error}")
                if attempt < max_retries:
                    await asyncio.sleep(2)
            except Exception as e:
                last_error = e
                print(f"WARNING: LLM call failed (attempt {attempt + 1}/{max_retries + 1}): {e}")
                if attempt < max_retries:
                    await asyncio.sleep(2)
                else:
                    raise e
        raise last_error

    @staticmethod
    def strip_code_fences(text: str) -> str:
        """Remove markdown code fences (```markdown, ```, etc.) from LLM output."""
        # Remove opening fences like ```markdown, ```md, ```text, or bare ```
        text = re.sub(r'^\s*```(?:markdown|md|text)?\s*\n?', '', text, flags=re.MULTILINE)
        # Remove closing fences
        text = re.sub(r'\n?\s*```\s*$', '', text, flags=re.MULTILINE)
        return text.strip()

    async def humanize_text(self, text: str) -> str:
        """Run text through a second LLM pass to make it sound naturally human-written."""
        prompt = f"""You are an expert academic editor who specializes in making text sound naturally written by a human researcher.

Rewrite the following academic text to sound more authentically human-written while preserving ALL factual content, data, and citations. Apply these techniques:

1. **Vary sentence rhythm** — Mix short declarative sentences (5-8 words) with longer complex ones. Avoid every sentence being the same length.
2. **Use first-person where natural** — Use "we observed", "our analysis suggests", "we found that" instead of passive voice everywhere.
3. **Add specificity** — Replace vague phrases like "significant impact" with more precise language. Reference specific figures, percentages, or examples.
4. **Remove AI-giveaway transitions** — Eliminate or replace: "Furthermore", "Moreover", "It is important to note", "In conclusion", "Additionally", "It is worth mentioning". Use natural connectors instead.
5. **Introduce slight imperfections** — Occasionally use dashes for asides — like this — or parenthetical remarks. Use rhetorical questions sparingly.
6. **Vary paragraph length** — Not every paragraph should be 3-5 sentences. Some can be 1-2 sentences for emphasis.
7. **Show thinking process** — Occasionally reference methodology choices: "We chose X over Y because..."

IMPORTANT RULES:
- Keep ALL markdown formatting (##, ###, **bold**, lists, etc.) exactly as-is.
- Do NOT add code fences around your output.
- Do NOT change the section header.
- Preserve the same academic tone — just make it sound like a real researcher wrote it, not a language model.
- Keep the content approximately the same length. Do not remove substantial content.

TEXT TO HUMANIZE:
{text}"""

        try:
            humanized = await self.invoke_llm_with_timeout(prompt, timeout_seconds=90)
            humanized = self.strip_code_fences(humanized)
            # Sanity check: if the humanized version is too short, return original
            if len(humanized) < len(text) * 0.5:
                print("WARNING: Humanized text too short, using original.")
                return text
            return humanized
        except Exception as e:
            print(f"WARNING: Humanization failed, using original text: {e}")
            return text

    def search_web(self, query: str, max_results: int = 5) -> List[dict]:
        """Search the web using Tavily and return results with citations."""
        try:
            results = self.tavily_client.search(query=query, max_results=max_results)
            return [
                {
                    "title": r.get("title", ""),
                    "url": r.get("url", ""),
                    "content": str(r.get("content", ""))[:500]
                }
                for r in results.get("results", [])
            ]
        except Exception as e:
            print(f"Search error: {e}")
            return []

    async def suggest_topics(self, profession: str) -> dict:
        prompt = f"""You are a research advisor. Based on the user's profession: "{profession}"
        
    Suggest exactly 3 cutting-edge, specific research topics that would be relevant and impactful.
    Each topic should be suitable for an IEEE-style academic paper.

    Return ONLY a JSON array with 3 objects, each having "title" and "description" keys.
    Example format:
    [
      {{"title": "Topic Title Here", "description": "A brief 1-2 sentence description of why this topic is relevant."}},
      ...
    ]"""

        try:
            content = await self.invoke_llm_with_timeout(prompt, timeout_seconds=30)
            # Parse JSON from response
            start = content.find('[')
            end = content.rfind(']') + 1
            if start != -1 and end > start:
                topics = json.loads(content[start:end])
                return {"topics": topics}
            else:
                raise ValueError("No valid JSON array found")
        except Exception as e:
            print(f"Error suggesting topics: {e}")
            return {
                "topics": [
                    {"title": f"AI Applications in {profession}", "description": "Exploring how artificial intelligence is transforming the field."},
                    {"title": f"Sustainable Practices in {profession}", "description": "Analyzing eco-friendly approaches and their impact."},
                    {"title": f"Digital Transformation in {profession}", "description": "Examining the role of technology in modernizing practices."}
                ]
            }

    async def plan_research(self, topic: str) -> dict:
        search_results = self.search_web(f"{topic} research academic", max_results=5)
        
        if search_results:
            sources_context = "\n".join([
                f"- {r['title']}: {r['content'][:200]}... (Source: {r['url']})"
                for r in search_results
            ])
            source_prompt = f"Based on these relevant sources:\n{sources_context}"
        else:
            sources_context = "No external sources found."
            source_prompt = "Generate the outline based on your internal knowledge."

        prompt = f"""You are an expert research planner. Create a detailed IEEE-format research paper outline for the topic:

    "{topic}"

    {source_prompt}

    Generate a strict IEEE paper outline with these sections:
    1. Abstract
    2. Introduction (with subsections: Background, Problem Statement, Objectives)
    3. Literature Review
    4. Methodology
    5. Results and Discussion
    6. Conclusion
    7. Future Work
    8. References

    For each section, provide:
    - A brief description of what should be covered
    - Key points to address
    - Relevant sources from the search results

    Return the outline as a JSON object with this structure:
    {{
      "title": "Full Research Paper Title",
      "sections": [
        {{
          "id": "1",
          "name": "Abstract",
          "description": "Brief description",
          "key_points": ["point1", "point2"],
          "sources": ["relevant source URLs"]
        }},
        ...
      ],
      "sources": [
        {{"title": "Source Title", "url": "URL", "relevance": "Why relevant"}}
      ]
    }}"""

        try:
            content = await self.invoke_llm_with_timeout(prompt, timeout_seconds=90)
            start = content.find('{')
            end = content.rfind('}') + 1
            if start != -1 and end > start:
                outline = json.loads(content[start:end])
                return {"outline": outline, "search_results": search_results}
            else:
                raise ValueError("No valid JSON found")
        except Exception as e:
            print(f"Error planning research: {e}")
            with open("backend_error.log", "a") as f:
                f.write(f"Error planning research for topic '{topic}': {e}\n")
            return {
                 "outline": {
                    "title": f"Research on {topic}",
                    "sections": [],
                    "sources": []
                 },
                 "search_results": []
            }
    
    async def refine_topic(self, profession: str, topic_input: str, current_topic: str) -> dict:
        prompt = f"""You are a research advisor for a "{profession}". 
        current topic: "{current_topic}"
        User input: "{topic_input}"

        If the user input is a new topic proposal, set it as the refined topic.
        If the user is ignoring the current topic, just acknowledge the new input.
        
        Return a JSON object:
        {{
            "message": "Response to the user",
            "refined_topic": "The finalized topic name (or null if still discussing)"
        }}
        """
        try:
            print(f"DEBUG REFINE TOPIC: Profession='{profession}', Input='{topic_input}', Current='{current_topic}'")
            content = await self.invoke_llm_with_timeout(prompt, timeout_seconds=30)
            print(f"DEBUG LLM RESPONSE: {content}")
            start = content.find('{')
            end = content.rfind('}') + 1
            if start != -1 and end > start:
                response = json.loads(content[start:end])
                print(f"DEBUG PARSED RESPONSE: {response}")
                return response
            print("DEBUG: No valid JSON found in response")
            return {"message": "Could not parse response", "refined_topic": None}
        except Exception as e:
            print(f"DEBUG ERROR: {e}")
            return {"message": "I can help you research that. Shall we proceed with planning?", "refined_topic": topic_input}

    async def refine_plan(self, current_plan: dict, feedback: str) -> dict:
        prompt = f"""Update this research outline based on user feedback:
        Current Plan: {json.dumps(current_plan)}
        User Feedback: "{feedback}"
        
        Return the updated plan as a JSON object with the same structure.
        """
        try:
            content = await self.invoke_llm_with_timeout(prompt, timeout_seconds=30)
            start = content.find('{')
            end = content.rfind('}') + 1
            if start != -1 and end > start:
                updated_plan = json.loads(content[start:end])
                return {"updated_plan": updated_plan}
            return {"updated_plan": current_plan}
        except Exception as e:
            return {"updated_plan": current_plan}

    async def generate_paper(self, topic: str, outline: Dict[str, Any]):
        """
        Generates a full paper based on the provided outline.
        Yields Server-Sent Events (SSE) data strings.
        """
        raw_title = outline.get("title", topic)
        sections = outline.get("sections", [])
        
        # 1. Generate Title
        title = raw_title
        if len(raw_title.split()) <= 3 or raw_title == topic:
            try:
                msg = f"Generate a single formal IEEE academic paper title for: \"{topic}\". Return ONLY the title text."
                title = await self.invoke_llm_with_timeout(msg, timeout_seconds=20)
                title = title.strip().strip('"')
            except Exception:
                title = f"Research on {topic}"
        
        yield f"data: {json.dumps({'type': 'title', 'content': f'# {title}'})}\n\n"
        await asyncio.sleep(0.1)
        
        # 2. Generate Sections
        for section in sections:
            section_name = section.get("name", "Section")
            description = section.get("description", "")
            key_points = section.get("key_points", [])
            
            # Search for content
            search_query = f"{topic} {section_name}"
            section_sources = self.search_web(search_query, max_results=3)
            
            sources_text = "\n".join([
                f"- {s['title']}: {s['content'][:300]}... [Source: {s['url']}]"
                for s in section_sources
            ])
            
            prompt = f"""Write the "{section_name}" section for an IEEE academic paper on "{topic}".
            Context: {description}
            Key points: {', '.join(key_points)}
            Sources: {sources_text}
            
            IMPORTANT FORMATTING RULES:
            - Write the content directly as plain text with markdown headers (## for sections, ### for subsections).
            - Do NOT wrap your response in code fences (``` or ```markdown). Output raw markdown directly.
            - Use **bold** for emphasis, numbered/bulleted lists as needed.
            - Start with the section header like "## {section_name}" on the first line."""

            try:
                section_content = await self.invoke_llm_with_timeout(prompt, timeout_seconds=90)
                section_content = self.strip_code_fences(section_content)
                # Humanize: second LLM pass to make text sound naturally human-written
                section_content = await self.humanize_text(section_content)
                
                yield f"data: {json.dumps({'type': 'section', 'name': section_name, 'content': section_content})}\n\n"
                await asyncio.sleep(0.3)
                
                if section_sources:
                    for s in section_sources:
                        yield f"data: {json.dumps({'type': 'source', 'section': section_name, 'source': s})}\n\n"
            except Exception as e:
                yield f"data: {json.dumps({'type': 'error', 'section': section_name, 'message': str(e)})}\n\n"
        
        yield f"data: {json.dumps({'type': 'complete'})}\n\n"

    async def write_section(self, topic: str, section: Dict[str, Any]):
        """
        Generates content for a single section.
        Yields raw byte chunks for StreamingResponse.
        """
        prompt = f"""Write the "{section.get('name')}" section for a paper on "{topic}".
        Context: {section.get('description')}
        
        IMPORTANT: Write directly as plain text with markdown headers. Do NOT wrap in code fences (``` or ```markdown)."""
        try:
            content = await self.invoke_llm_with_timeout(prompt, timeout_seconds=30)
            content = self.strip_code_fences(content)
            content = await self.humanize_text(content)
            yield content.encode('utf-8')
        except Exception as e:
            yield f"Error: {e}".encode('utf-8')
