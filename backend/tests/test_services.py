import os
import asyncio
from dotenv import load_dotenv

load_dotenv()

async def test_genai():
    print("Testing Google GenAI...")
    try:
        from langchain_google_genai import ChatGoogleGenerativeAI
        from langchain_core.messages import HumanMessage
        
        api_key = os.getenv("GOOGLE_API_KEY")
        if not api_key:
            print("ERROR: GOOGLE_API_KEY not found in env")
            return
            
        llm = ChatGoogleGenerativeAI(model="gemini-2.5-pro", google_api_key=api_key)
        resp = await llm.ainvoke([HumanMessage(content="Hello, say 'GenAI Works!'")])
        print(f"SUCCESS: {resp.content}")
    except Exception as e:
        print(f"ERROR GenAI: {e}")

def test_tavily():
    print("\nTesting Tavily...")
    try:
        from tavily import TavilyClient
        
        api_key = os.getenv("TAVILY_API_KEY")
        if not api_key:
            print("ERROR: TAVILY_API_KEY not found in env")
            return

        client = TavilyClient(api_key=api_key)
        # Simple search
        results = client.search(query="Python programming", max_results=1)
        print(f"SUCCESS: Found {len(results.get('results', []))} results")
    except Exception as e:
        print(f"ERROR Tavily: {e}")

if __name__ == "__main__":
    asyncio.run(test_genai())
    test_tavily()
