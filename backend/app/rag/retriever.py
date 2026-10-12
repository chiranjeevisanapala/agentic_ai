from typing import List, Dict, Any, Optional
from app.rag.vector_store import vector_store
from app.schemas.knowledge import KnowledgeSearchResult

class SupportRAGRetriever:
    """
    RAG retriever service that queries vector store, applies relevance threshold,
    and structures knowledge chunks for LLM agent context.
    """
    def __init__(self, top_k: int = 3, threshold: float = 0.20):
        self.top_k = top_k
        self.threshold = threshold

    def retrieve(self, query: str, category: Optional[str] = None) -> List[KnowledgeSearchResult]:
        results = vector_store.search(query=query, top_k=self.top_k, category=category)
        structured_results: List[KnowledgeSearchResult] = []
        
        for doc, score in results:
            if score >= self.threshold:
                structured_results.append(
                    KnowledgeSearchResult(
                        id=doc.get("article_code", "KB-000"),
                        article_code=doc.get("article_code", "KB-000"),
                        title=doc.get("title", ""),
                        category=doc.get("category", ""),
                        snippet=doc.get("summary", "") or doc.get("content", "")[:300],
                        score=round(score, 3),
                        policy_reference=doc.get("policy_reference"),
                        action_permissions=doc.get("action_permissions", []),
                    )
                )
        return structured_results

    def format_context_for_prompt(self, results: List[KnowledgeSearchResult]) -> str:
        if not results:
            return "No specific support documentation found for this query."
        
        snippets = []
        for r in results:
            snippets.append(
                f"### [{r.article_code}] {r.title} (Policy: {r.policy_reference or 'Standard'})\n"
                f"- Permitted Actions: {', '.join(r.action_permissions) if r.action_permissions else 'Standard guidance'}\n"
                f"- Summary: {r.snippet}"
            )
        return "\n\n".join(snippets)

rag_retriever = SupportRAGRetriever()
