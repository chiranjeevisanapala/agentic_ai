from app.api.auth_router import router as auth_router
from app.api.ticket_router import router as ticket_router
from app.api.chat_router import router as chat_router
from app.api.customer_router import router as customer_router
from app.api.knowledge_router import router as knowledge_router
from app.api.tool_router import router as tool_router
from app.api.analytics_router import router as analytics_router

__all__ = [
    "auth_router",
    "ticket_router",
    "chat_router",
    "customer_router",
    "knowledge_router",
    "tool_router",
    "analytics_router",
]
