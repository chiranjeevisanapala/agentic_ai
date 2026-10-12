import math
import re
from typing import List, Dict, Any, Tuple
from collections import Counter
from app.rag.knowledge_base import SUPPORT_KNOWLEDGE_DOCUMENTS

class SimpleVectorStore:
    """
    In-memory vector store with TF-IDF cosine similarity and semantic keyword weighting.
    Provides fast, deterministic, zero-dependency RAG retrieval with vector scoring.
    """
    def __init__(self):
        self.documents: List[Dict[str, Any]] = []
        self.vocabulary: Dict[str, int] = {}
        self.idf: Dict[str, float] = {}
        self.doc_vectors: List[List[float]] = []
        self._initialize_default_knowledge()

    def _tokenize(self, text: str) -> List[str]:
        text = text.lower()
        # Extract alphanumeric words
        words = re.findall(r'\b[a-z0-9_\-\$]+\b', text)
        return [w for w in words if len(w) > 1]

    def _initialize_default_knowledge(self):
        self.index_documents(SUPPORT_KNOWLEDGE_DOCUMENTS)

    def index_documents(self, docs: List[Dict[str, Any]]):
        self.documents = docs
        all_tokenized = []
        df_counter = Counter()

        for doc in docs:
            full_text = f"{doc.get('title', '')} {doc.get('category', '')} {' '.join(doc.get('tags', []))} {doc.get('summary', '')} {doc.get('content', '')}"
            tokens = self._tokenize(full_text)
            all_tokenized.append(tokens)
            unique_tokens = set(tokens)
            for t in unique_tokens:
                df_counter[t] += 1

        num_docs = len(docs)
        self.vocabulary = {term: idx for idx, term in enumerate(df_counter.keys())}
        self.idf = {
            term: math.log((num_docs + 1) / (df + 1)) + 1.0
            for term, df in df_counter.items()
        }

        # Build document vectors
        self.doc_vectors = []
        for tokens in all_tokenized:
            vec = self._vectorize_tokens(tokens)
            self.doc_vectors.append(vec)

    def _vectorize_tokens(self, tokens: List[str]) -> List[float]:
        tf = Counter(tokens)
        total_tokens = max(len(tokens), 1)
        vec = [0.0] * len(self.vocabulary)
        
        for term, count in tf.items():
            if term in self.vocabulary:
                idx = self.vocabulary[term]
                tf_norm = count / total_tokens
                vec[idx] = tf_norm * self.idf.get(term, 1.0)
        
        # Normalize vector
        magnitude = math.sqrt(sum(v * v for v in vec))
        if magnitude > 0:
            vec = [v / magnitude for v in vec]
        return vec

    def _cosine_similarity(self, vec_a: List[float], vec_b: List[float]) -> float:
        if len(vec_a) != len(vec_b):
            return 0.0
        return sum(a * b for a, b in zip(vec_a, vec_b))

    def search(self, query: str, top_k: int = 3, category: str = None) -> List[Tuple[Dict[str, Any], float]]:
        query_tokens = self._tokenize(query)
        if not query_tokens:
            return []

        query_vec = self._vectorize_tokens(query_tokens)
        scored_results: List[Tuple[Dict[str, Any], float]] = []

        for idx, doc in enumerate(self.documents):
            if category and doc.get("category", "").lower() != category.lower():
                continue
            
            doc_vec = self.doc_vectors[idx]
            sim = self._cosine_similarity(query_vec, doc_vec)
            
            # Boost score if tags or title match query terms directly
            title_tokens = set(self._tokenize(doc.get("title", "")))
            tag_tokens = set(self._tokenize(" ".join(doc.get("tags", []))))
            overlap = len(set(query_tokens).intersection(title_tokens.union(tag_tokens)))
            boosted_sim = min(1.0, sim + (0.15 * overlap))
            
            scored_results.append((doc, boosted_sim))

        scored_results.sort(key=lambda x: x[1], reverse=True)
        return scored_results[:top_k]

# Global singleton vector store
vector_store = SimpleVectorStore()
