import os
import json
import time

from PIL import Image
from dotenv import load_dotenv
from google import genai

load_dotenv()

client = genai.Client(
    api_key=os.getenv("GEMINI_API_KEY")
)


def extract_inventory(image_path):

    image = Image.open(image_path)

    prompt = """
You are an AI inventory assistant.

Analyze this grocery image carefully.

Detect every visible grocery item.

Return ONLY valid JSON.

Example:

{
  "items":[
    {
      "item_name":"Milk",
      "quantity":1,
      "unit":"packet",
      "category":"Dairy",
      "expiry_date":null
    }
  ]
}

Rules:
- No explanation.
- JSON only.
- If expiry is not visible, use null.
- Estimate quantity.
- Categories:
  Fruit
  Vegetable
  Dairy
  Bakery
  Protein
  Beverage
  Pantry
  Other
"""

    for attempt in range(5):

        try:

            response = client.models.generate_content(
                model="gemini-2.5-flash-lite",
                contents=[prompt, image]
            )

            text = response.text.strip()

            # Remove markdown if Gemini returns it
            if text.startswith("```json"):
                text = text.replace("```json", "").replace("```", "").strip()

            return json.loads(text)

        except Exception as e:

            print(f"Attempt {attempt+1}/5 failed")
            print(e)

            if attempt == 4:
                raise

            time.sleep(5)