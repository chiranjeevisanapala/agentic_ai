from typing import List, Optional
from pydantic import BaseModel
from datetime import datetime

class KnowledgeArticleBase(BaseModel):
    article_code: str
    title: str
    category: str
    content: str
    summary: Optional[str] = None
    tags: List[str] = []
    policy_reference: Optional[str] = None
    action_permissions: List[str] = []

class KnowledgeArticleCreate(KnowledgeArticleBase):
    pass

class KnowledgeArticleResponse(KnowledgeArticleBase):
    id: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class KnowledgeSearchResult(BaseModel):
    id: str
    article_code: str
    title: str
    category: str
    snippet: str
    score: float
    policy_reference: Optional[str] = None
    action_permissions: List[str] = []
