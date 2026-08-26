from fastapi import APIRouter, UploadFile, File, HTTPException
import traceback
import os

from services.groq_vision import extract_inventory
router = APIRouter(tags=["Scan"])


@router.post("/scan")
async def scan(file: UploadFile = File(...)):

    try:

        os.makedirs("uploads", exist_ok=True)

        filepath = os.path.join("uploads", file.filename)

        with open(filepath, "wb") as f:
            f.write(await file.read())

        result = extract_inventory(filepath)

        if "items" not in result:

            raise HTTPException(
                status_code=400,
                detail="No items returned by AI."
            )

        return {
            "success": True,
            "message": "Items detected successfully",
            "items": result["items"]
        }

    except Exception as e:

        print("=" * 80)
        traceback.print_exc()
        print("=" * 80)

        raise HTTPException(
            status_code=500,
            detail=str(e)
        )