from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel

import json
import re

from database import get_db

from models import (
    User,
    Inventory,
    ChatHistory,
    Shopping
)

from services.groq_service import ask_llm


router = APIRouter()


# =========================================================
# REQUEST MODEL
# =========================================================

class ChatRequest(BaseModel):
    user_id: int
    conversation_id: int
    message: str


# =========================================================
# NORMALIZE ITEM NAME
# =========================================================

def normalize_item_name(name):

    if not name:
        return ""

    name = str(name).lower().strip()

    replacements = {

        "tomatoes": "tomato",
        "potatoes": "potato",
        "onions": "onion",
        "eggs": "egg",

        "green chili": "green chilli",
        "green chilies": "green chilli",
        "green chillies": "green chilli",

        "ginger garlic": "ginger-garlic paste",
        "ginger garlic paste": "ginger-garlic paste",

        "cooking oil": "oil",
        "vegetable oil": "oil",

    }

    return replacements.get(
        name,
        name
    )


# =========================================================
# SHOPPING CATEGORY
# =========================================================

def get_shopping_category(item_name):

    name = item_name.lower().strip()


    # =====================================================
    # FRUIT
    # =====================================================

    fruits = [

        "apple",
        "banana",
        "mango",
        "orange",
        "grapes",
        "grape",
        "pineapple",
        "papaya",
        "watermelon",
        "strawberry",
        "lemon",
        "lime",

    ]


    # =====================================================
    # VEGETABLE
    # =====================================================

    vegetables = [

        "tomato",
        "onion",
        "potato",
        "spinach",
        "carrot",
        "capsicum",
        "bell pepper",
        "green chilli",
        "green chili",
        "chilli",
        "chili",
        "corn",
        "peas",
        "cabbage",
        "cauliflower",
        "broccoli",
        "ginger",
        "garlic",
        "coriander",

    ]


    # =====================================================
    # DAIRY
    # =====================================================

    dairy = [

        "paneer",
        "milk",
        "cheese",
        "curd",
        "yogurt",
        "yoghurt",
        "butter",
        "cream",

    ]


    # =====================================================
    # PROTEIN
    # =====================================================

    protein = [

        "egg",
        "eggs",
        "chicken",
        "fish",
        "prawn",
        "prawns",
        "mutton",
        "meat",
        "tofu",

    ]


    # =====================================================
    # SPICES
    # =====================================================

    spices = [

        "turmeric",
        "cumin",
        "coriander powder",
        "garam masala",
        "chilli powder",
        "chili powder",
        "black pepper",
        "pepper",
        "cardamom",
        "clove",
        "cloves",
        "cinnamon",
        "salt",

    ]


    # =====================================================
    # OILS
    # =====================================================

    oils = [

        "oil",
        "olive oil",
        "sunflower oil",
        "mustard oil",
        "coconut oil",
        "groundnut oil",
        "vegetable oil",

    ]


    # =====================================================
    # CATEGORY CHECK
    # =====================================================

    if any(
        item in name
        for item in fruits
    ):
        return "Fruit"


    if any(
        item in name
        for item in vegetables
    ):
        return "Vegetable"


    if any(
        item in name
        for item in dairy
    ):
        return "Dairy"


    if any(
        item in name
        for item in protein
    ):
        return "Protein"


    if any(
        item in name
        for item in spices
    ):
        return "Spices"


    if any(
        item in name
        for item in oils
    ):
        return "Oils"


    return "Other"


# =========================================================
# EXTRACT JSON FROM AI RESPONSE
# =========================================================

def extract_json(text):

    if not text:
        return None


    text = str(text).strip()


    # Remove thinking tags
    text = re.sub(
        r"<think>.*?</think>",
        "",
        text,
        flags=re.DOTALL
    )


    # Remove markdown
    text = text.replace(
        "```json",
        ""
    )

    text = text.replace(
        "```",
        ""
    )

    text = text.strip()


    # Find JSON object
    start = text.find("{")
    end = text.rfind("}")


    if start == -1 or end == -1:

        print(
            "NO JSON OBJECT FOUND"
        )

        return None


    json_text = text[
        start:end + 1
    ]


    try:

        return json.loads(
            json_text
        )

    except json.JSONDecodeError as e:

        print(
            "JSON PARSE ERROR:",
            e
        )

        print(
            "JSON TEXT:",
            json_text
        )

        return None


# =========================================================
# SAVE ASSISTANT MESSAGE
# =========================================================

def save_assistant_message(
    db,
    user_id,
    conversation_id,
    message
):

    ai_message = ChatHistory(

        user_id=user_id,

        conversation_id=conversation_id,

        role="assistant",

        message=message

    )

    db.add(
        ai_message
    )

    db.commit()


# =========================================================
# CHAT
# =========================================================

@router.post("/chat")
def chat(
    req: ChatRequest,
    db: Session = Depends(get_db)
):


    # =====================================================
    # GET USER
    # =====================================================

    user = (

        db.query(User)

        .filter(
            User.id == req.user_id
        )

        .first()

    )


    if not user:

        raise HTTPException(
            status_code=404,
            detail="User not found"
        )


    # =====================================================
    # GET INVENTORY
    # =====================================================

    inventory = (

        db.query(Inventory)

        .filter(

            Inventory.user_id
            ==
            req.user_id,

            Inventory.quantity > 0

        )

        .all()

    )


    # =====================================================
    # SAVE USER MESSAGE
    # =====================================================

    user_message = ChatHistory(

        user_id=req.user_id,

        conversation_id=req.conversation_id,

        role="user",

        message=req.message

    )

    db.add(
        user_message
    )

    db.commit()


    # =====================================================
    # GET PREVIOUS CHAT
    # =====================================================

    previous_messages = (

        db.query(ChatHistory)

        .filter(

            ChatHistory.conversation_id
            ==
            req.conversation_id

        )

        .order_by(
            ChatHistory.created_at.asc()
        )

        .limit(20)

        .all()

    )


    conversation_context = ""


    for msg in previous_messages:

        conversation_context += (

            f"{msg.role}: "
            f"{msg.message}\n"

        )


    # =====================================================
    # ASK GROQ
    # =====================================================

    reply = ask_llm(

        req.message,

        inventory,

        user,

        conversation_context

    )


    print("\n")
    print("=" * 70)
    print("AI RAW RESPONSE")
    print("=" * 70)
    print(reply)
    print("=" * 70)


    # =====================================================
    # IMPORTANT
    # EXTRACT JSON
    # =====================================================

    data = extract_json(
        reply
    )


    print("=" * 70)
    print("EXTRACTED DATA")
    print("=" * 70)
    print(data)
    print("=" * 70)


    # =====================================================
    # IF JSON ACTION EXISTS
    # =====================================================

    if data:

        action = data.get(
            "action"
        )


        print(
            "ACTION:",
            action
        )


        # =================================================
        # USE INVENTORY
        # =================================================

        if action == "use":

            item_name = data.get(
                "item",
                ""
            )


            quantity = float(
                data.get(
                    "quantity",
                    0
                )
            )


            item = (

                db.query(Inventory)

                .filter(

                    Inventory.user_id
                    ==
                    req.user_id,

                    Inventory.item_name.ilike(
                        item_name
                    )

                )

                .first()

            )


            if not item:

                reply_text = (

                    f"{item_name} was not "
                    "found in your inventory."

                )

                save_assistant_message(

                    db,

                    req.user_id,

                    req.conversation_id,

                    reply_text

                )

                return {
                    "reply": reply_text
                }


            if float(item.quantity) < quantity:

                reply_text = (

                    f"You only have "
                    f"{item.quantity} "
                    f"{item.unit} "
                    f"{item.item_name} left."

                )

                save_assistant_message(

                    db,

                    req.user_id,

                    req.conversation_id,

                    reply_text

                )

                return {
                    "reply": reply_text
                }


            # Reduce quantity
            item.quantity = (

                float(item.quantity)
                -
                quantity

            )


            # Delete if empty
            if item.quantity <= 0:

                db.delete(
                    item
                )


            db.commit()


            reply_text = data.get(

                "reply",

                f"Okay! I removed "
                f"{quantity} "
                f"{item_name}."

            )


            save_assistant_message(

                db,

                req.user_id,

                req.conversation_id,

                reply_text

            )


            return {
                "reply": reply_text
            }


        # =================================================
        # ADD INVENTORY
        # =================================================

        elif action == "add":

            item_name = data.get(
                "item",
                ""
            )


            quantity = float(
                data.get(
                    "quantity",
                    1
                )
            )


            unit = data.get(
                "unit",
                "pcs"
            )


            category = data.get(
                "category",
                "Other"
            )


            # Allowed categories
            allowed_categories = {

                "Fruit": "Fruit",

                "Vegetable": "Vegetable",

                "Vegetables": "Vegetable",

                "Dairy": "Dairy",

                "Protein": "Protein",

                "Meat": "Protein",

                "Spices": "Spices",

                "Spice": "Spices",

                "Oils": "Oils",

                "Oil": "Oils",

                "Other": "Other"

            }


            category = allowed_categories.get(

                category,

                "Other"

            )


            # Find existing inventory
            item = (

                db.query(Inventory)

                .filter(

                    Inventory.user_id
                    ==
                    req.user_id,

                    Inventory.item_name.ilike(
                        item_name
                    )

                )

                .first()

            )


            if item:

                item.quantity = (

                    float(item.quantity)
                    +
                    quantity

                )

                # Update category too
                item.category = category


            else:

                item = Inventory(

                    user_id=req.user_id,

                    item_name=item_name,

                    quantity=quantity,

                    unit=unit,

                    category=category

                )

                db.add(
                    item
                )


            db.commit()


            reply_text = data.get(

                "reply",

                f"Great! I added "
                f"{quantity} "
                f"{item_name} "
                "to your inventory."

            )


            save_assistant_message(

                db,

                req.user_id,

                req.conversation_id,

                reply_text

            )


            return {
                "reply": reply_text
            }


        # =================================================
        # ADD TO SHOPPING LIST
        # =================================================

        elif action == "add_to_shopping_list":

            items = data.get(
                "items",
                []
            )


            print("=" * 70)
            print("SHOPPING ACTION")
            print("=" * 70)
            print(
                "ITEMS RECEIVED:",
                items
            )
            print("=" * 70)


            if not items:

                reply_text = (

                    "There are no missing "
                    "ingredients to add."

                )


                save_assistant_message(

                    db,

                    req.user_id,

                    req.conversation_id,

                    reply_text

                )


                return {
                    "reply": reply_text
                }


            added_items = []


            skipped_items = []


            # =============================================
            # LOOP THROUGH MISSING INGREDIENTS
            # =============================================

            for shopping_item in items:


                name = str(

                    shopping_item.get(
                        "item",
                        ""
                    )

                ).strip()


                if not name:

                    continue


                quantity = shopping_item.get(

                    "quantity",

                    1

                )


                unit = shopping_item.get(

                    "unit",

                    "pcs"

                )


                # -----------------------------------------
                # CATEGORY
                # -----------------------------------------

                category = get_shopping_category(
                    name
                )


                print(

                    f"PROCESSING: "
                    f"{name} | "
                    f"{quantity} {unit} | "
                    f"{category}"

                )


                # =========================================
                # CHECK INVENTORY
                # =========================================

                normalized_name = (
                    normalize_item_name(
                        name
                    )
                )


                inventory_match = None


                for inv_item in inventory:


                    normalized_inventory = (

                        normalize_item_name(

                            inv_item.item_name

                        )

                    )


                    if (
                        normalized_inventory
                        ==
                        normalized_name
                    ):

                        inventory_match = (
                            inv_item
                        )

                        break


                # Already in inventory
                if inventory_match:

                    print(

                        f"SKIPPED - "
                        f"{name} already "
                        "exists in inventory"

                    )

                    skipped_items.append(
                        name
                    )

                    continue


                # =========================================
                # CHECK SHOPPING LIST
                # =========================================

                shopping_records = (

                    db.query(Shopping)

                    .filter(

                        Shopping.user_id
                        ==
                        req.user_id,

                        Shopping.checked
                        ==
                        False

                    )

                    .all()

                )


                existing = None


                for shopping_record in shopping_records:


                    existing_name = (

                        normalize_item_name(

                            shopping_record.name

                        )

                    )


                    if (
                        existing_name
                        ==
                        normalized_name
                    ):

                        existing = (
                            shopping_record
                        )

                        break


                # =========================================
                # UPDATE EXISTING SHOPPING ITEM
                # =========================================

                if existing:

                    existing.quantity = (

                        float(existing.quantity)
                        +
                        float(quantity)

                    )


                    # Make sure category is correct
                    existing.category = (
                        category
                    )


                    print(

                        f"UPDATED SHOPPING: "
                        f"{name}"

                    )


                # =========================================
                # CREATE NEW SHOPPING ITEM
                # =========================================

                else:

                    new_shopping = Shopping(

                        user_id=req.user_id,

                        name=name,

                        category=category,

                        quantity=quantity,

                        unit=unit,

                        checked=False

                    )


                    db.add(
                        new_shopping
                    )


                    print(

                        f"NEW SHOPPING ITEM: "
                        f"{name} | "
                        f"{category}"

                    )


                added_items.append(
                    name
                )


            # =============================================
            # COMMIT
            # =============================================

            try:

                db.commit()

                print("=" * 70)
                print(
                    "SHOPPING DATABASE COMMIT SUCCESS"
                )
                print("=" * 70)


            except Exception as e:

                db.rollback()

                print(
                    "SHOPPING DATABASE ERROR:",
                    e
                )

                raise HTTPException(

                    status_code=500,

                    detail=(
                        "Failed to save "
                        "shopping list: "
                        + str(e)
                    )

                )


            # =============================================
            # RESPONSE
            # =============================================

            if added_items:

                reply_text = (

                    "I've added the missing "
                    "ingredients to your "
                    "shopping list:\n\n"

                    +

                    "\n".join(

                        f"✓ {item}"

                        for item in added_items

                    )

                )

            else:

                reply_text = (

                    "All of those ingredients "
                    "are already available "
                    "in your inventory or "
                    "shopping list."

                )


            save_assistant_message(

                db,

                req.user_id,

                req.conversation_id,

                reply_text

            )


            return {
                "reply": reply_text
            }


    # =====================================================
    # NORMAL RESPONSE
    # =====================================================

    save_assistant_message(

        db,

        req.user_id,

        req.conversation_id,

        reply

    )


    return {
        "reply": reply
    }


# =========================================================
# CHAT HISTORY
# =========================================================

@router.get(
    "/chat/history/{conversation_id}"
)
def get_chat_history(

    conversation_id: int,

    db: Session = Depends(get_db)

):


    messages = (

        db.query(ChatHistory)

        .filter(

            ChatHistory.conversation_id
            ==
            conversation_id

        )

        .order_by(

            ChatHistory.created_at.asc()

        )

        .all()

    )


    return [

        {

            "role": m.role,

            "message": m.message

        }

        for m in messages

    ]