import os
import pickle

import faiss
from sentence_transformers import SentenceTransformer


# --------------------------------------------------
# PATHS
# --------------------------------------------------

BASE_DIR = os.path.dirname(
    os.path.dirname(os.path.abspath(__file__))
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
# LOAD FAISS
# --------------------------------------------------

print("Loading recipe vector store...")

index = faiss.read_index(INDEX_PATH)

with open(METADATA_PATH, "rb") as f:
    recipes = pickle.load(f)

print(f"Loaded {len(recipes)} recipes")


# --------------------------------------------------
# SEARCH RECIPES
# --------------------------------------------------

def search_recipes(
    query: str,
    top_k: int = 5
):

    # Create embedding for user question
    query_embedding = model.encode(
        [query],
        convert_to_numpy=True
    )

    # Search FAISS
    distances, indices = index.search(
        query_embedding,
        top_k
    )

    results = []

    for distance, idx in zip(
        distances[0],
        indices[0]
    ):

        if idx == -1:
            continue

        results.append({
            "recipe": recipes[idx],
            "distance": float(distance)
        })

    return results


# --------------------------------------------------
# TEST
# --------------------------------------------------

if __name__ == "__main__":

    query = input(
        "\nEnter your question: "
    )

    results = search_recipes(
        query,
        top_k=5
    )

    print("\n==============================")
    print("RETRIEVED RECIPES")
    print("==============================")

    for i, result in enumerate(
        results,
        start=1
    ):

        print(
            f"\n--- Recipe {i} ---"
        )

        print(result["recipe"])

        print(
            f"\nDistance: {result['distance']}"
        )