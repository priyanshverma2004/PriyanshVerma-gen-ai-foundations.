import os
import pickle

import faiss
from pypdf import PdfReader
from sentence_transformers import SentenceTransformer


# --------------------------------------------------
# PATHS
# --------------------------------------------------

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

PDF_PATH = os.path.join(
    BASE_DIR,
    "data",
    "Recipe Book For project.pdf"
)

VECTORSTORE_DIR = os.path.join(
    BASE_DIR,
    "vectorstore"
)

INDEX_PATH = os.path.join(
    VECTORSTORE_DIR,
    "recipes.faiss"
)

METADATA_PATH = os.path.join(
    VECTORSTORE_DIR,
    "recipes.pkl"
)


# --------------------------------------------------
# EMBEDDING MODEL
# --------------------------------------------------

MODEL_NAME = "sentence-transformers/all-MiniLM-L6-v2"

model = SentenceTransformer(MODEL_NAME)


# --------------------------------------------------
# READ PDF
# --------------------------------------------------

def extract_pdf_text():

    print("Reading PDF...")

    reader = PdfReader(PDF_PATH)

    pages = []

    for page in reader.pages:

        text = page.extract_text()

        if text:
            pages.append(text)

    return "\n".join(pages)


# --------------------------------------------------
# SPLIT INTO RECIPES
# --------------------------------------------------
import re


def create_recipe_chunks(text):

    print("Creating recipe chunks...")

    lines = text.splitlines()

    recipes = []
    current_recipe = []

    for line in lines:

        line = line.strip()

        if not line:
            continue

        # Detect recipe heading:
        # Example:
        # 1. Paneer Butter Masala
        # 2. Palak Paneer
        # 8. Matar Paneer
        #
        # But NOT:
        # 1. Cut paneer into cubes...
        # 2. Add the onions...
        
        recipe_heading = re.match(
            r"^(\d+)\.\s+([A-Z][A-Za-z\s&-]{2,50})$",
            line
        )

        if recipe_heading:

            if current_recipe:
                recipes.append(
                    "\n".join(current_recipe)
                )

            current_recipe = [line]

        else:

            current_recipe.append(line)

    # Add final recipe
    if current_recipe:
        recipes.append(
            "\n".join(current_recipe)
        )

    print(
        f"Found {len(recipes)} recipe chunks"
    )

    return recipes
# --------------------------------------------------
# CREATE EMBEDDINGS
# --------------------------------------------------

def create_embeddings(recipes):

    print("Creating embeddings...")

    embeddings = model.encode(
        recipes,
        convert_to_numpy=True,
        show_progress_bar=True
    )

    return embeddings


# --------------------------------------------------
# CREATE FAISS INDEX
# --------------------------------------------------

def create_faiss_index(embeddings):

    print("Creating FAISS index...")

    dimension = embeddings.shape[1]

    index = faiss.IndexFlatL2(dimension)

    index.add(embeddings)

    return index


# --------------------------------------------------
# SAVE VECTORSTORE
# --------------------------------------------------

def save_vectorstore(index, recipes):

    os.makedirs(
        VECTORSTORE_DIR,
        exist_ok=True
    )

    faiss.write_index(
        index,
        INDEX_PATH
    )

    with open(
        METADATA_PATH,
        "wb"
    ) as f:

        pickle.dump(
            recipes,
            f
        )

    print("\nVector store created successfully!")

    print(
        f"FAISS index: {INDEX_PATH}"
    )

    print(
        f"Metadata: {METADATA_PATH}"
    )


# --------------------------------------------------
# MAIN
# --------------------------------------------------

def main():

    if not os.path.exists(PDF_PATH):

        raise FileNotFoundError(
            f"PDF not found: {PDF_PATH}"
        )

    text = extract_pdf_text()

    if not text.strip():

        raise ValueError(
            "No text could be extracted from the PDF."
        )

    recipes = create_recipe_chunks(text)

    if not recipes:

        raise ValueError(
            "No recipes were found in the PDF."
        )

    embeddings = create_embeddings(
        recipes
    )

    index = create_faiss_index(
        embeddings
    )

    save_vectorstore(
        index,
        recipes
    )


if __name__ == "__main__":
    main()