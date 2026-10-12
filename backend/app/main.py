from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.config import settings
from app.database import init_db, AsyncSessionLocal
from app.core.seed_data import seed_initial_data
from app.api.auth_router import router as auth_router
from app.api.ticket_router import router as ticket_router
from app.api.chat_router import router as chat_router
from app.api.customer_router import router as customer_router
from app.api.knowledge_router import router as knowledge_router
from app.api.tool_router import router as tool_router
from app.api.analytics_router import router as analytics_router

@asynccontextmanager
async def lifespan(app: FastAPI):
    # 1. Initialize DB schema
    await init_db()
    
    # 2. Seed initial demo customer, duplicate invoice & policies
    async with AsyncSessionLocal() as session:
        await seed_initial_data(session)
    
    yield

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Production-grade Agentic AI Customer Support Resolution System with 6 specialized agents, RAG vector retrieval, and safe tool execution.",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount Routers
app.include_router(auth_router, prefix=settings.API_V1_STR)
app.include_router(ticket_router, prefix=settings.API_V1_STR)
app.include_router(chat_router, prefix=settings.API_V1_STR)
app.include_router(customer_router, prefix=settings.API_V1_STR)
app.include_router(knowledge_router, prefix=settings.API_V1_STR)
app.include_router(tool_router, prefix=settings.API_V1_STR)
app.include_router(analytics_router, prefix=settings.API_V1_STR)

@app.get("/")
async def root():
    return {
        "system": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "status": "online",
        "docs": "/docs",
        "agents": [
            "Triage Agent",
            "Customer Context Agent",
            "Knowledge Retrieval Agent (RAG)",
            "Resolution Agent",
            "Escalation Agent",
            "Decision / Reviewer Agent"
        ]
    }

@app.get("/api/health")
async def health_check():
    return {
        "status": "healthy",
        "database": "connected",
        "vector_rag": "indexed",
        "llm_provider": settings.DEFAULT_LLM_PROVIDER
    }
