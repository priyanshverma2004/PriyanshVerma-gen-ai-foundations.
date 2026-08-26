import os
import json
import re

from groq import Groq
from dotenv import load_dotenv

from rag.retriever import search_recipes


# =========================================================
# ENVIRONMENT
# =========================================================

load_dotenv()


# =========================================================
# GROQ CLIENT
# =========================================================

client = Groq(
    api_key=os.getenv("GROQ_API_KEY")
)


# =========================================================
# INVENTORY FORMATTER
# =========================================================

def build_inventory_text(inventory):

    if not inventory:
        return "No ingredients available."

    lines = []

    for item in inventory:

        lines.append(
            f"- {item.item_name} "
            f"({item.quantity} {item.unit}) "
            f"Category: {item.category}, "
            f"Expires: {item.expiry_date}"
        )

    return "\n".join(lines)


# =========================================================
# USER PROFILE FORMATTER
# =========================================================

def build_user_profile(user):

    if not user:
        return "No user profile available."

    return f"""
Name: {user.name}
Diet: {user.diet_type}
Cuisine: {user.cuisine}
Spice Level: {user.spice_level}
Servings: {user.servings}
Allergies: {user.allergy}
Health Goal: {user.health_goal}
Favorite Foods: {user.favorite_foods}
Avoid Foods: {user.avoid_foods}
Cooking Style: {user.cooking_style}
Meal Time: {user.meal_time}
Budget: {user.budget}
"""


# =========================================================
# NORMALIZE INGREDIENT NAME
# =========================================================

def normalize_ingredient(name):

    if not name:
        return ""

    name = str(name).lower().strip()

    # Remove extra spaces
    name = re.sub(
        r"\s+",
        " ",
        name
    )

    replacements = {

        # vegetables
        "tomatoes": "tomato",
        "potatoes": "potato",
        "onions": "onion",
        "carrots": "carrot",
        "spinaches": "spinach",

        # fruits
        "apples": "apple",
        "bananas": "banana",

        # dairy
        "paneer cubes": "paneer",
        "paneer cube": "paneer",
        "cheeses": "cheese",
        "milks": "milk",

        # spices
        "cumin seeds": "cumin",
        "cumin seed": "cumin",
        "garam masala powder": "garam masala",
        "turmeric powder": "turmeric",
        "chilli powder": "chilli powder",
        "chili powder": "chilli powder",
        "green chili": "green chilli",
        "green chilies": "green chilli",
        "green chillies": "green chilli",

        # ginger garlic
        "ginger garlic paste": "ginger-garlic paste",
        "ginger garlic": "ginger-garlic paste",

        # oils
        "cooking oil": "oil",
        "vegetable oil": "oil",
        "cooking oils": "oil",

        # salt
        "table salt": "salt",

    }

    return replacements.get(
        name,
        name
    )


# =========================================================
# GET RAG CONTEXT
# =========================================================

def get_rag_context(message):

    try:

        results = search_recipes(
            message,
            top_k=5
        )

        if not results:

            return "NO_RECIPE_FOUND"

        rag_context = ""

        for index, result in enumerate(
            results,
            start=1
        ):

            if isinstance(
                result,
                dict
            ):

                recipe_text = (
                    result.get("text")
                    or result.get("content")
                    or result.get("recipe")
                    or str(result)
                )

                distance = result.get(
                    "distance"
                )

                rag_context += (
                    f"\n--- Retrieved Recipe "
                    f"{index} ---\n"
                )

                rag_context += recipe_text

                if distance is not None:

                    rag_context += (
                        f"\nDistance: {distance}\n"
                    )

            elif isinstance(
                result,
                tuple
            ):

                recipe_text = str(
                    result[0]
                )

                rag_context += (
                    f"\n--- Retrieved Recipe "
                    f"{index} ---\n"
                )

                rag_context += recipe_text

            else:

                rag_context += (
                    f"\n--- Retrieved Recipe "
                    f"{index} ---\n"
                )

                rag_context += str(
                    result
                )

        return rag_context

    except Exception as e:

        print(
            "RAG ERROR:",
            e
        )

        return "RAG_ERROR"


# =========================================================
# PERSONALIZED QUESTION
# =========================================================

def is_personalized_question(message):

    message_lower = message.lower()

    keywords = [

        "suggest",
        "recommend",
        "recipe",
        "recipes",
        "cook",
        "meal",
        "breakfast",
        "lunch",
        "dinner",
        "snack",
        "healthy",
        "diet",
        "meal plan",
        "what should i eat",
        "what can i cook",
        "food idea",
        "what can i make",
        "make something",
        "can i make",
        "do i have ingredients",
        "ingredients do i need"

    ]

    return any(
        keyword in message_lower
        for keyword in keywords
    )


# =========================================================
# RECIPE QUESTION DETECTOR
# =========================================================

def is_recipe_inventory_question(message):

    message_lower = message.lower()

    keywords = [

        "can i make",
        "can we make",
        "make ",
        "cook ",
        "ingredients",
        "what do i need",
        "what ingredients",
        "do i have",
        "missing ingredients",
        "what am i missing",
        "what is missing",
        "make it",
        "recipe"

    ]

    return any(
        keyword in message_lower
        for keyword in keywords
    )


# =========================================================
# EXTRACT RECIPE INGREDIENTS FROM RAG TEXT
# =========================================================

def extract_recipe_ingredients(rag_context):

    ingredients = []

    if not rag_context:
        return ingredients

    # Find Ingredients section
    match = re.search(
        r"Ingredients(.*?)(?:Step-by-Step Method|Steps|Method|RAG keywords:|Page \d+|$)",
        rag_context,
        flags=re.IGNORECASE | re.DOTALL
    )

    if not match:

        return ingredients

    ingredient_text = match.group(1)

    lines = ingredient_text.splitlines()

    for line in lines:

        line = line.strip()

        if not line:
            continue

        # Remove bullets
        line = re.sub(
            r"^[•\-\*]\s*",
            "",
            line
        )

        # Remove leading recipe number
        line = re.sub(
            r"^\d+\.\s*",
            "",
            line
        )

        if not line:
            continue

        # ---------------------------------------------
        # Quantity + unit + ingredient
        # ---------------------------------------------

        pattern = re.match(
            r"^(\d+(?:\.\d+)?|\d+/\d+|\d+–\d+)?\s*"
            r"(kg|g|mg|l|ml|tbsp|tsp|cup|cups|pcs|piece|pieces|"
            r"bunch|clove|cloves|can|packet|pack)?\s*"
            r"(.+)$",
            line,
            flags=re.IGNORECASE
        )

        if not pattern:
            continue

        quantity_text = pattern.group(1)
        unit = pattern.group(2)
        item_name = pattern.group(3).strip()

        # Skip accidental section text
        if item_name.lower() in [
            "step-by-step method",
            "method",
            "ingredients"
        ]:
            continue

        # ---------------------------------------------
        # Quantity
        # ---------------------------------------------

        quantity = 1

        if quantity_text:

            try:

                if "/" in quantity_text:

                    numerator, denominator = (
                        quantity_text.split("/")
                    )

                    quantity = (
                        float(numerator)
                        /
                        float(denominator)
                    )

                elif "–" in quantity_text:

                    # For ranges use lower value
                    quantity = float(
                        quantity_text.split("–")[0]
                    )

                else:

                    quantity = float(
                        quantity_text
                    )

            except:

                quantity = 1

        # ---------------------------------------------
        # Unit
        # ---------------------------------------------

        if not unit:

            unit = "pcs"

        # ---------------------------------------------
        # Clean ingredient
        # ---------------------------------------------

        item_name = re.sub(
            r"\([^)]*\)",
            "",
            item_name
        ).strip()

        ingredients.append({

            "item": item_name,

            "quantity": quantity,

            "unit": unit.lower()

        })

    return ingredients


# =========================================================
# QUANTITY CONVERSION
# =========================================================

def convert_to_base_quantity(
    quantity,
    unit
):

    unit = unit.lower()

    # grams
    if unit == "kg":
        return quantity * 1000, "g"

    if unit in [
        "g",
        "gram",
        "grams"
    ]:
        return quantity, "g"

    # milliliters
    if unit == "l":
        return quantity * 1000, "ml"

    if unit in [
        "ml",
        "milliliter",
        "milliliters"
    ]:
        return quantity, "ml"

    return quantity, unit


# =========================================================
# CHECK IF INVENTORY HAS INGREDIENT
# =========================================================

def find_inventory_item(
    ingredient_name,
    inventory
):

    target = normalize_ingredient(
        ingredient_name
    )

    for item in inventory:

        inventory_name = normalize_ingredient(
            item.item_name
        )

        # Exact match
        if inventory_name == target:

            return item

        # Handle common partial names
        if (
            target in inventory_name
            or
            inventory_name in target
        ):

            return item

    return None


# =========================================================
# COMPARE RECIPE WITH INVENTORY
# =========================================================

def compare_recipe_with_inventory(
    recipe_ingredients,
    inventory
):

    available = []

    missing = []

    partial = []


    for ingredient in recipe_ingredients:

        ingredient_name = ingredient["item"]

        required_quantity = ingredient["quantity"]

        required_unit = ingredient["unit"]


        inventory_item = find_inventory_item(
            ingredient_name,
            inventory
        )


        # ---------------------------------------------
        # NOT FOUND
        # ---------------------------------------------

        if not inventory_item:

            missing.append({

                "item":
                    ingredient_name,

                "quantity":
                    required_quantity,

                "unit":
                    required_unit

            })

            continue


        # ---------------------------------------------
        # FOUND
        # ---------------------------------------------

        available_quantity = inventory_item.quantity

        available_unit = inventory_item.unit


        # ---------------------------------------------
        # Convert compatible units
        # ---------------------------------------------

        required_base, required_base_unit = (
            convert_to_base_quantity(
                required_quantity,
                required_unit
            )
        )

        available_base, available_base_unit = (
            convert_to_base_quantity(
                available_quantity,
                available_unit
            )
        )


        # ---------------------------------------------
        # Same compatible unit
        # ---------------------------------------------

        if required_base_unit == available_base_unit:

            if available_base >= required_base:

                available.append({

                    "item":
                        ingredient_name,

                    "required_quantity":
                        required_quantity,

                    "required_unit":
                        required_unit,

                    "available_quantity":
                        available_quantity,

                    "available_unit":
                        available_unit

                })

            else:

                remaining = (
                    required_base
                    -
                    available_base
                )

                partial.append({

                    "item":
                        ingredient_name,

                    "required_quantity":
                        required_quantity,

                    "required_unit":
                        required_unit,

                    "available_quantity":
                        available_quantity,

                    "available_unit":
                        available_unit,

                    "remaining_quantity":
                        remaining,

                    "remaining_unit":
                        required_base_unit

                })

        else:

            # Unit cannot safely be compared
            # but ingredient exists
            available.append({

                "item":
                    ingredient_name,

                "required_quantity":
                    required_quantity,

                "required_unit":
                    required_unit,

                "available_quantity":
                    available_quantity,

                "available_unit":
                    available_unit

            })


    return {

        "available":
            available,

        "partial":
            partial,

        "missing":
            missing

    }


# =========================================================
# FORMAT RECIPE CHECK
# =========================================================

def format_recipe_check(
    comparison
):

    text = ""

    available = comparison["available"]

    partial = comparison["partial"]

    missing = comparison["missing"]


    if available:

        text += "\nYou already have:\n"

        for item in available:

            text += (
                f"✓ {item['item']} "
                f"({item['available_quantity']} "
                f"{item['available_unit']})\n"
            )


    if partial:

        text += (
            "\nYou have some, but need more:\n"
        )

        for item in partial:

            text += (
                f"△ {item['item']} — "
                f"you have "
                f"{item['available_quantity']} "
                f"{item['available_unit']}, "
                f"but need "
                f"{item['required_quantity']} "
                f"{item['required_unit']}\n"
            )


    if missing:

        text += "\nYou are missing:\n"

        for item in missing:

            text += (
                f"✗ {item['item']} "
                f"({item['quantity']} "
                f"{item['unit']})\n"
            )


    if (
        not missing
        and
        not partial
    ):

        text += (
            "\n✓ You have all the ingredients "
            "needed for this recipe."
        )


    return text.strip()


# =========================================================
# MAIN LLM FUNCTION
# =========================================================

def ask_llm(
    message: str,
    inventory,
    user,
    conversation_context=""
):

    # =====================================================
    # INVENTORY
    # =====================================================

    inventory_text = build_inventory_text(
        inventory
    )


    # =====================================================
    # USER PROFILE
    # =====================================================

    user_profile = build_user_profile(
        user
    )


    # =====================================================
    # RAG
    # =====================================================

    rag_context = get_rag_context(
        message
    )


    # =====================================================
    # DETERMINISTIC RECIPE CHECK
    # =====================================================

    recipe_check_text = ""

    recipe_check_data = None


    if is_recipe_inventory_question(
        message
    ):

        recipe_ingredients = (
            extract_recipe_ingredients(
                rag_context
            )
        )


        if recipe_ingredients:

            recipe_check_data = (
                compare_recipe_with_inventory(
                    recipe_ingredients,
                    inventory
                )
            )


            recipe_check_text = (
                format_recipe_check(
                    recipe_check_data
                )
            )


    # =====================================================
    # PERSONALIZATION
    # =====================================================

    personalized = (
        is_personalized_question(
            message
        )
    )


    # =====================================================
    # PROMPT
    # =====================================================

    prompt = f"""

You are FridgeAI Chef.

You are an intelligent AI kitchen assistant.

You have access to:

1. User inventory
2. User profile
3. Previous conversation
4. Recipe knowledge base through RAG
5. A deterministic recipe/inventory comparison


=========================================================
CURRENT INVENTORY
=========================================================

{inventory_text}


=========================================================
USER PROFILE
=========================================================

{user_profile}


=========================================================
PREVIOUS CONVERSATION
=========================================================

{conversation_context}


=========================================================
RETRIEVED RAG RECIPES
=========================================================

{rag_context}


=========================================================
RECIPE / INVENTORY COMPARISON
=========================================================

{recipe_check_text}


=========================================================
CURRENT USER MESSAGE
=========================================================

{message}


=========================================================
IMPORTANT RECIPE RULE
=========================================================

When a recipe was retrieved from RAG:

Use the retrieved recipe as the source
for its ingredients and cooking steps.

Do NOT invent different ingredients
when an exact recipe exists.


=========================================================
INVENTORY COMPARISON RULE
=========================================================

The section called:

RECIPE / INVENTORY COMPARISON

was calculated from the actual database inventory.

Trust it.

Do NOT say an ingredient is missing if it
appears under "You already have".

Do NOT say an ingredient is available if
it appears under "You are missing".


=========================================================
WHEN USER ASKS ABOUT MISSING INGREDIENTS
=========================================================

Clearly tell the user:

Available:
✓ ingredient

Missing:
✗ ingredient

If some quantity is insufficient:

△ ingredient

Then explain how much is available
and how much is required.


=========================================================
SHOPPING LIST RULE
=========================================================

If the user says:

- add missing ingredients
- add these to shopping list
- add missing items
- put them on shopping list
- buy these
- add them to my shopping list

Return ONLY valid JSON.

Use:

{{
    "action": "add_to_shopping_list",
    "items": [
        {{
            "item": "Paneer",
            "quantity": 250,
            "unit": "g"
        }}
    ],
    "reply": "I've added the missing ingredients to your shopping list."
}}

IMPORTANT:

Only add ingredients from the actual
MISSING list.

Do NOT add ingredients the user already has.

For partial ingredients, add only the
remaining required quantity when it is
known.


=========================================================
INVENTORY ACTION RULE
=========================================================

If the user says:

I bought...
I purchased...
I added...

Return:

{{
    "action": "add",
    "item": "Tomato",
    "quantity": 3,
    "unit": "pcs",
    "category": "Vegetable",
    "reply": "Great! I added 3 tomatoes to your inventory."
}}


If the user says:

I used...
I consumed...
I finished...
Remove...

Return:

{{
    "action": "use",
    "item": "Tomato",
    "quantity": 2,
    "reply": "Okay! I removed 2 tomatoes from your inventory."
}}


Return ONLY JSON for inventory actions.


=========================================================
GENERAL QUESTIONS
=========================================================

For questions such as:

What is tomato?
What is cumin?
What is protein?

Answer normally.

Do not unnecessarily mention
the user profile.


=========================================================
PERSONALIZATION
=========================================================

For recipe recommendations use:

- Diet
- Allergies
- Cuisine
- Favorite foods
- Avoid foods
- Budget
- Cooking style
- Spice level
- Servings
- Inventory


=========================================================
CONVERSATION CONTEXT
=========================================================

Maintain the current topic.

If the user says:

"Okay, give me."

"Yes."

"Give me the steps."

"How do I make it?"

"Can I make it?"

Use the previous conversation
to understand what "it" means.


=========================================================
RAG FALLBACK
=========================================================

If the exact requested recipe is not
in the knowledge base:

Clearly say that the exact recipe
was not found.

If appropriate, you may provide a
generated recipe using general cooking
knowledge.

Clearly label it:

"Generated recipe — not from the
FridgeAI recipe knowledge base."


=========================================================
CURRENT TASK
=========================================================

Answer the user's current message naturally.

"""


    # =====================================================
    # CALL GROQ
    # =====================================================

    completion = client.chat.completions.create(

        model="openai/gpt-oss-20b",

        messages=[

            {
                "role": "system",

                "content":
                    "You are FridgeAI Chef, an expert AI chef, meal planner, and kitchen assistant."
            },

            {
                "role": "user",

                "content":
                    prompt
            }

        ],

        temperature=0.3,

        max_tokens=1500
    )


    # =====================================================
    # RETURN
    # =====================================================

    return (
        completion
        .choices[0]
        .message
        .content
        .strip()
    )


# =========================================================
# MEAL PLAN
# =========================================================

def generate_meal_plan(
    inventory,
    user=None,
    days=5
):

    inventory_text = build_inventory_text(
        inventory
    )


    user_profile = (
        build_user_profile(user)
        if user
        else
        "No user profile."
    )


    prompt = f"""

You are FridgeAI Chef.

Generate a {days}-day personalized meal plan.


================================================
INVENTORY
================================================

{inventory_text}


================================================
USER PROFILE
================================================

{user_profile}


================================================
RULES
================================================

1. Use available inventory ingredients first.

2. Respect allergies.

3. Respect diet.

4. Respect cuisine preference.

5. Respect spice level.

6. Respect servings.

7. If ingredients are missing,
   put them inside missing_items.

8. Return ONLY valid JSON.


FORMAT:

{{
    "days": [
        {{
            "day": "Monday",
            "meals": [
                {{
                    "type": "Breakfast",
                    "name": "Meal name",
                    "calories": 300,
                    "available": true,
                    "missing_items": []
                }},
                {{
                    "type": "Lunch",
                    "name": "Meal name",
                    "calories": 500,
                    "available": false,
                    "missing_items": [
                        "Ingredient"
                    ]
                }},
                {{
                    "type": "Dinner",
                    "name": "Meal name",
                    "calories": 600,
                    "available": true,
                    "missing_items": []
                }}
            ]
        }}
    ]
}}

"""


    completion = client.chat.completions.create(

        model="llama-3.3-70b-versatile",

        messages=[

            {
                "role": "system",

                "content":
                    "You are an expert meal planner."
            },

            {
                "role": "user",

                "content":
                    prompt
            }

        ],

        temperature=0.5,

        max_tokens=2500
    )


    return (
        completion
        .choices[0]
        .message
        .content
        .strip()
    )