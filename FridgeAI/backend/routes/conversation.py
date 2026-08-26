from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from database import get_db
from models import Conversation

router = APIRouter(
    prefix="/conversation",
    tags=["Conversation"]
)
from models import Conversation, ChatHistory



@router.delete("/{conversation_id}")
def delete_conversation(
    conversation_id: int,
    db: Session = Depends(get_db)
):

    # Delete all messages
    db.query(ChatHistory).filter(
        ChatHistory.conversation_id == conversation_id
    ).delete()

    # Delete conversation
    db.query(Conversation).filter(
        Conversation.id == conversation_id
    ).delete()

    db.commit()

    return {
        "message": "Conversation deleted"
    }

# Create New Conversation
@router.post("/")
def create_conversation(
    user_id: int,
    db: Session = Depends(get_db)
):

    conversation = Conversation(
        user_id=user_id,
        title="New Chat"
    )

    db.add(conversation)
    db.commit()
    db.refresh(conversation)

    return conversation


# Get All Conversations
@router.get("/{user_id}")
def get_conversations(
    user_id: int,
    db: Session = Depends(get_db)
):

    conversations = (
        db.query(Conversation)
        .filter(
            Conversation.user_id == user_id
        )
        .order_by(
            Conversation.created_at.desc()
        )
        .all()
    )

    return conversations