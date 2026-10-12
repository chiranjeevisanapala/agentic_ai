import uuid
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.database import get_db
from app.models.knowledge import KnowledgeArticle
from app.schemas.knowledge import KnowledgeArticleCreate, KnowledgeArticleResponse, KnowledgeSearchResult
from app.rag.retriever import rag_retriever
from app.rag.vector_store import vector_store

router = APIRouter(prefix="/knowledge", tags=["Knowledge Base & RAG"])

@router.get("/articles", response_model=List[KnowledgeArticleResponse])
async def list_articles(db: AsyncSession = Depends(get_db)):
    stmt = select(KnowledgeArticle).order_by(KnowledgeArticle.created_at)
    res = await db.execute(stmt)
    articles = res.scalars().all()
    return [KnowledgeArticleResponse.model_validate(a) for a in articles]

@router.get("/search", response_model=List[KnowledgeSearchResult])
async def search_knowledge(
    q: str = Query(..., description="Semantic search query"),
    category: Optional[str] = Query(None, description="Category filter"),
    top_k: int = Query(4, ge=1, le=10)
):
    results = rag_retriever.retrieve(query=q, category=category)
    return results[:top_k]

@router.post("/articles", response_model=KnowledgeArticleResponse)
async def create_article(doc_in: KnowledgeArticleCreate, db: AsyncSession = Depends(get_db)):
    article = KnowledgeArticle(
        id=str(uuid.uuid4()),
        article_code=doc_in.article_code,
        title=doc_in.title,
        category=doc_in.category,
        content=doc_in.content,
        summary=doc_in.summary,
        tags=doc_in.tags,
        policy_reference=doc_in.policy_reference,
        action_permissions=doc_in.action_permissions
    )
    db.add(article)
    await db.commit()
    await db.refresh(article)

    # Re-index in vector store
    stmt = select(KnowledgeArticle)
    res = await db.execute(stmt)
    all_articles = res.scalars().all()
    docs = [
        {
            "article_code": a.article_code,
            "title": a.title,
            "category": a.category,
            "content": a.content,
            "summary": a.summary,
            "tags": a.tags,
            "policy_reference": a.policy_reference,
            "action_permissions": a.action_permissions
        }
        for a in all_articles
    ]
    vector_store.index_documents(docs)

    return KnowledgeArticleResponse.model_validate(article)
