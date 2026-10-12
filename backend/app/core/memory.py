import time
from typing import List, Dict, Any, Optional
import json

class ConversationMemoryManager:
    """
    Manages multi-turn short-term conversation context.
    Supports Redis caching when available, with an in-memory TTL buffer fallback.
    """
    def __init__(self):
        self._in_memory_store: Dict[str, List[Dict[str, Any]]] = {}
        self._last_accessed: Dict[str, float] = {}
        self._ttl_seconds = 3600 * 4 # 4 hours TTL

    def _cleanup_expired(self):
        now = time.time()
        expired_keys = [
            k for k, last_time in self._last_accessed.items()
            if now - last_time > self._ttl_seconds
        ]
        for k in expired_keys:
            self._in_memory_store.pop(k, None)
            self._last_accessed.pop(k, None)

    async def get_history(self, session_id: str, limit: int = 10) -> List[Dict[str, Any]]:
        self._cleanup_expired()
        self._last_accessed[session_id] = time.time()
        messages = self._in_memory_store.get(session_id, [])
        return messages[-limit:]

    async def add_message(self, session_id: str, role: str, content: str, metadata: Optional[Dict[str, Any]] = None):
        self._cleanup_expired()
        self._last_accessed[session_id] = time.time()
        if session_id not in self._in_memory_store:
            self._in_memory_store[session_id] = []
        
        entry = {
            "role": role, # 'customer', 'assistant', 'system', 'agent_action'
            "content": content,
            "metadata": metadata or {},
            "timestamp": time.time()
        }
        self._in_memory_store[session_id].append(entry)

    async def clear_history(self, session_id: str):
        self._in_memory_store.pop(session_id, None)
        self._last_accessed.pop(session_id, None)

    def format_history_for_prompt(self, messages: List[Dict[str, Any]]) -> str:
        if not messages:
            return "No previous conversation history."
        
        lines = []
        for msg in messages:
            role = "Customer" if msg.get("role") == "customer" else "Support Assistant"
            content = msg.get("content", "")
            lines.append(f"{role}: {content}")
        return "\n".join(lines)

memory_manager = ConversationMemoryManager()
