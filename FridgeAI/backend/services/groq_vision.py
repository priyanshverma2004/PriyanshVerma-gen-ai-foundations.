import base64
import json
import os

from groq import Groq
from dotenv import load_dotenv


# =========================================================
# LOAD ENV
# =========================================================

load_dotenv()


# =========================================================
# GROQ CLIENT
# =========================================================

client = Groq(
    api_key=os.getenv("GROQ_API_KEY")
)


# =========================================================
# ALLOWED CATEGORIES
# =========================================================

ALLOWED_CATEGORIES = {
    "Fruit",
    "Vegetable",
    "Dairy",
    "Protein",
    "Spices",
    "Oils",
}


# =========================================================
# CATEGORY VALIDATION
# =========================================================

def validate_category(category):

    if not category:
        return "Other"

    category = str(category).strip().lower()

    category_map = {
        "fruit": "Fruit",

        "vegetable": "Vegetable",
        "vegetables": "Vegetable",

        "dairy": "Dairy",

        "protein": "Protein",

        "spice": "Spices",
        "spices": "Spices",

        "oil": "Oils",
        "oils": "Oils",
    }

    result = category_map.get(
        category
    )

    if result in ALLOWED_CATEGORIES:
        return result

    return "Other"


# =========================================================
# EXTRACT INVENTORY FROM IMAGE
# =========================================================

def extract_inventory(image_path):

    # -----------------------------------------------------
    # READ IMAGE
    # -----------------------------------------------------

    with open(
        image_path,
        "rb"
    ) as f:

        image_bytes = f.read()


    # -----------------------------------------------------
    # BASE64
    # -----------------------------------------------------

    image = base64.b64encode(
        image_bytes
    ).decode("utf-8")


    # -----------------------------------------------------
    # PROMPT
    # -----------------------------------------------------

    prompt = """
Analyze this grocery/fridge image.

Identify the clearly visible grocery or food items.

For each item return:

- item_name
- quantity
- unit
- category
- expiry_date


CATEGORY RULES:

There are ONLY six supported categories:

Fruit
Vegetable
Dairy
Protein
Spices
Oils

Use one of these categories when the item
clearly belongs to it.

If an item does NOT belong to one of these
six categories, return:

Other

Do NOT create new categories.

Examples:

Apple -> Fruit
Banana -> Fruit

Tomato -> Vegetable
Potato -> Vegetable
Spinach -> Vegetable

Milk -> Dairy
Paneer -> Dairy
Cheese -> Dairy

Egg -> Protein
Chicken -> Protein
Fish -> Protein

Turmeric -> Spices
Cumin -> Spices
Garam Masala -> Spices

Olive Oil -> Oils
Sunflower Oil -> Oils
Mustard Oil -> Oils

Bread -> Other
Rice -> Other
Sugar -> Other
Biscuits -> Other
Tea -> Other

QUANTITY:

If exact quantity cannot be determined,
use quantity 1.

Use units such as:

pcs
kg
g
L
ml
bottle
pack

EXPIRY:

Only return an expiry date if it is clearly
visible in the image.

Otherwise return null.

IMPORTANT:

Do not duplicate the same physical item just
because the image contains repeated/cropped
views of it.

Return ONLY JSON.

Use this exact structure:

{
  "items": [
    {
      "item_name": "Milk",
      "quantity": 1,
      "unit": "L",
      "category": "Dairy",
      "expiry_date": null
    }
  ]
}
"""


    # =====================================================
    # GROQ VISION
    # =====================================================

    response = client.chat.completions.create(

        model="qwen/qwen3.6-27b",

        messages=[
            {
                "role": "user",

                "content": [

                    {
                        "type": "text",
                        "text": prompt
                    },

                    {
                        "type": "image_url",

                        "image_url": {
                            "url":
                            f"data:image/jpeg;base64,{image}"
                        }
                    }

                ]
            }
        ],

        # IMPORTANT
        # Disable Qwen thinking for this task
        reasoning_effort="none",

        # Force JSON output
        response_format={
            "type": "json_object"
        },

        temperature=0,

        max_completion_tokens=1500,

        stream=False
    )


    # =====================================================
    # GET FINAL CONTENT
    # =====================================================

    message = (
        response
        .choices[0]
        .message
    )


    print(
        "\n=============================="
    )

    print(
        "GROQ VISION RESPONSE"
    )

    print(
        "=============================="
    )

    print(
        message.content
    )


    # =====================================================
    # CHECK RESPONSE
    # =====================================================

    if not message.content:

        raise Exception(
            "Groq Vision returned empty content."
        )


    # =====================================================
    # PARSE JSON
    # =====================================================

    try:

        result = json.loads(
            message.content
        )

    except json.JSONDecodeError as e:

        print(
            "Invalid JSON returned:"
        )

        print(
            message.content
        )

        raise Exception(
            f"Invalid JSON from Groq Vision: {e}"
        )


    # =====================================================
    # CHECK ITEMS
    # =====================================================

    if "items" not in result:

        raise Exception(
            "AI response does not contain 'items'."
        )


    if not isinstance(
        result["items"],
        list
    ):

        raise Exception(
            "'items' must be a list."
        )


    # =====================================================
    # VALIDATE ITEMS
    # =====================================================

    final_items = []


    for item in result["items"]:

        # -------------------------------------------------
        # NAME
        # -------------------------------------------------

        item_name = str(
            item.get(
                "item_name",
                "Unknown item"
            )
        ).strip()


        if not item_name:

            item_name = "Unknown item"


        # -------------------------------------------------
        # QUANTITY
        # -------------------------------------------------

        try:

            quantity = float(
                item.get(
                    "quantity",
                    1
                )
            )

        except:

            quantity = 1


        if quantity <= 0:

            quantity = 1


        # -------------------------------------------------
        # UNIT
        # -------------------------------------------------

        unit = str(
            item.get(
                "unit",
                "pcs"
            )
        ).strip()


        if not unit:

            unit = "pcs"


        # -------------------------------------------------
        # CATEGORY
        # -------------------------------------------------

        category = validate_category(
            item.get(
                "category"
            )
        )


        # -------------------------------------------------
        # EXPIRY
        # -------------------------------------------------

        expiry_date = item.get(
            "expiry_date"
        )


        if not expiry_date:

            expiry_date = None


        # -------------------------------------------------
        # ADD
        # -------------------------------------------------

        final_items.append({

            "item_name":
                item_name,

            "quantity":
                quantity,

            "unit":
                unit,

            "category":
                category,

            "expiry_date":
                expiry_date

        })


    # =====================================================
    # FINAL RESULT
    # =====================================================

    final_result = {
        "items": final_items
    }


    print(
        "\n=============================="
    )

    print(
        "FINAL AI ITEMS"
    )

    print(
        "=============================="
    )

    print(
        json.dumps(
            final_result,
            indent=2
        )
    )


    return final_result