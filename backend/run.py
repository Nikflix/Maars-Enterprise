import uvicorn

if __name__ == "__main__":
    print("=" * 60)
    print("[*] MAARS Enterprise Backend Starting...")
    print("=" * 60)
    print("[>] Server URL: http://localhost:8000")
    print("[>] API Docs: http://localhost:8000/docs")
    print("=" * 60)
    
    try:
        print("Starting Uvicorn on port 8001...")
        # Reload enabled for potential dev changes, app factory pattern via string import
        uvicorn.run("app.main:app", host="0.0.0.0", port=8001, log_level="debug", reload=True)
        print("Uvicorn run finished normally.")
    except BaseException as e:
        print(f"CRITICAL STARTUP ERROR: {e}")
        import traceback
        traceback.print_exc()
        with open("startup_error.log", "w") as f:
            f.write(f"Startup error: {e}\n")
            traceback.print_exc(file=f)
