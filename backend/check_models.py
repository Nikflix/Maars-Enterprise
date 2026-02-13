
import os
import sys
import google.generativeai as genai

output_file = "models_list.txt"
with open(output_file, "w") as f:
    f.write("Script started\n")
    try:
        os.environ["GOOGLE_API_KEY"] = "AIzaSyBPrr4YdnWBB9afPLqLsCsqKnDlVZwKvG4"
        genai.configure(api_key=os.environ["GOOGLE_API_KEY"])
        f.write("Configured API Key\n")

        f.write("--- Start Listing ---\n")
        models = list(genai.list_models())
        f.write(f"Found {len(models)} models\n")
        for m in models:
            f.write(f"Model: {m.name}\n")
            if 'generateContent' in m.supported_generation_methods:
                 f.write(f"  - Supports generateContent\n")
        f.write("--- End Listing ---\n")

    except Exception as e:
        f.write(f"Error accessing models: {e}\n")
        import traceback
        traceback.print_exc(file=f)

    f.write("Script finished\n")
