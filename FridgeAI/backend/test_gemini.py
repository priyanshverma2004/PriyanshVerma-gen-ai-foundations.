import os
from dotenv import load_dotenv
from google import genai

load_dotenv()

api_key = os.getenv("GEMINI_API_KEY")

print("=" * 50)
print("KEY FOUND:", api_key is not None)

if api_key:
    print("START :", api_key[:8])
    print("END   :", api_key[-6:])
print("=" * 50)

try:
    client = genai.Client(api_key=api_key)

    response = client.models.generate_content(
        model="gemini-2.5-flash",
        contents="Reply with exactly: Gemini Working"
    )

    print("\nSUCCESS")
    print(response.text)

except Exception as e:
    print("\nFAILED")
    print(type(e).__name__)
    print(e)