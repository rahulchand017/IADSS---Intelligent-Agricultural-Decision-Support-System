from fastapi import APIRouter

router = APIRouter()

@router.get('/health')
async def chatbot_health():
    return {'status': 'chatbot module coming soon'}