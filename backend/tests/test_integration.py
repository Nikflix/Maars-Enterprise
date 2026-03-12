import requests
import json
import time

BASE_URL = "http://localhost:8000"

def test_suggest_topics():
    print("Testing /suggest_topics...")
    try:
        payload = {"profession": "Software Engineer"}
        response = requests.post(f"{BASE_URL}/suggest_topics", json=payload)
        response.raise_for_status()
        data = response.json()
        if "topics" in data and len(data["topics"]) > 0:
            print("[PASS] /suggest_topics success")
        else:
            print("[FAIL] /suggest_topics returned unexpected format")
    except Exception as e:
        print(f"[FAIL] /suggest_topics failed: {e}")

def test_plan_research():
    print("Testing /plan_research...")
    try:
        payload = {"topic": "The Future of AI"}
        response = requests.post(f"{BASE_URL}/plan_research", json=payload)
        response.raise_for_status()
        data = response.json()
        if "outline" in data and "sections" in data["outline"]:
            print(f"[PASS] /plan_research success. Sections: {len(data['outline']['sections'])}")
            if len(data['outline']['sections']) == 0:
                print("[WARN] Sections is empty!")
            else:
                 for i, sec in enumerate(data['outline']['sections']):
                     print(f"  Section {i+1}: {sec.get('name', 'Unknown')}")
            return data["outline"]
        else:
            print("[FAIL] /plan_research returned unexpected format")
            return None
    except Exception as e:
        print(f"[FAIL] /plan_research failed: {e}")
        return None

def test_write_section(outline):
    print("Testing /write-section (streaming)...")
    if not outline or not outline.get("sections"):
        print("[WARN] Skipping /write-section (no outline or empty sections)")
        return

    try:
        section = outline["sections"][0]
        payload = {
            "section": section,
            "topic": "The Future of AI",
            "context": outline
        }
        response = requests.post(f"{BASE_URL}/write-section", json=payload, stream=True)
        response.raise_for_status()
        
        content = ""
        for chunk in response.iter_content(chunk_size=1024):
            if chunk:
                content += chunk.decode("utf-8")
        
        if len(content) > 10:
            print("[PASS] /write-section success")
        else:
            print("[FAIL] /write-section returned empty content")
    except Exception as e:
        print(f"[FAIL] /write-section failed: {e}")

def test_plagiarism():
    print("Testing /api/plagiarism/check...")
    try:
        payload = {"content": "This is a test sentence for plagiarism check. It should be unique enough."}
        response = requests.post(f"{BASE_URL}/api/plagiarism/check", json=payload)
        response.raise_for_status()
        data = response.json()
        if "similarity_score" in data:
            print("[PASS] /api/plagiarism/check success")
        else:
            print("[FAIL] /api/plagiarism/check returned unexpected format")
    except Exception as e:
        print(f"[FAIL] /api/plagiarism/check failed: {e}")

def test_download():
    print("Testing /download...")
    try:
        payload = {
            "title": "Test Paper",
            "content": "# Test Paper\n\nThis is a test.",
            "format": "pdf"
        }
        response = requests.post(f"{BASE_URL}/download", json=payload)
        response.raise_for_status()
        data = response.json()
        if "data" in data and "filename" in data:
            print("[PASS] /download success")
        else:
            print("[FAIL] /download returned unexpected format")
    except Exception as e:
        print(f"[FAIL] /download failed: {e}")

if __name__ == "__main__":
    print(f"Checking connectivity to {BASE_URL}...")
    try:
        requests.get(f"{BASE_URL}/")
        print("Backend is reachable.")
    except Exception:
        print("Backend is NOT running. Please start it first.")
        exit(1)

    test_suggest_topics()
    outline = test_plan_research()
    test_write_section(outline)
    test_plagiarism()
    test_download()
