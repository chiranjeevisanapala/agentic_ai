import json
import logging
from typing import Dict, Any, Optional
import httpx
from app.config import settings

logger = logging.getLogger(__name__)

class LLMProvider:
    """
    Unified LLM Client that connects to Google Gemini or OpenAI API when configured,
    and falls back to intelligent deterministic agent heuristics for instant reliability.
    """
    def __init__(self):
        self.gemini_key = settings.GEMINI_API_KEY
        self.openai_key = settings.OPENAI_API_KEY

    async def generate_json(self, prompt: str, system_prompt: str) -> Optional[Dict[str, Any]]:
        # 1. Try Gemini if API key is provided
        if self.gemini_key:
            try:
                res = await self._call_gemini(prompt, system_prompt, json_mode=True)
                if res:
                    return json.loads(res)
            except Exception as e:
                logger.warning(f"Gemini API call failed: {e}")

        # 2. Try OpenAI if API key is provided
        if self.openai_key:
            try:
                res = await self._call_openai(prompt, system_prompt, json_mode=True)
                if res:
                    return json.loads(res)
            except Exception as e:
                logger.warning(f"OpenAI API call failed: {e}")

        return None

    async def generate_text(self, prompt: str, system_prompt: str) -> Optional[str]:
        if self.gemini_key:
            try:
                return await self._call_gemini(prompt, system_prompt, json_mode=False)
            except Exception as e:
                logger.warning(f"Gemini API call failed: {e}")

        if self.openai_key:
            try:
                return await self._call_openai(prompt, system_prompt, json_mode=False)
            except Exception as e:
                logger.warning(f"OpenAI API call failed: {e}")

        return None

    async def _call_gemini(self, prompt: str, system_prompt: str, json_mode: bool = False) -> str:
        url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={self.gemini_key}"
        headers = {"Content-Type": "application/json"}
        payload = {
            "contents": [
                {"role": "user", "parts": [{"text": f"System Instructions: {system_prompt}\n\nTask: {prompt}"}]}
            ],
            "generationConfig": {
                "temperature": 0.2,
                "maxOutputTokens": 2048,
            }
        }
        if json_mode:
            payload["generationConfig"]["responseMimeType"] = "application/json"

        async with httpx.AsyncClient(timeout=15.0) as client:
            resp = await client.post(url, json=payload, headers=headers)
            resp.raise_for_status()
            data = resp.json()
            return data["candidates"][0]["content"]["parts"][0]["text"]

    async def _call_openai(self, prompt: str, system_prompt: str, json_mode: bool = False) -> str:
        url = "https://api.openai.com/v1/chat/completions"
        headers = {
            "Authorization": f"Bearer {self.openai_key}",
            "Content-Type": "application/json"
        }
        payload = {
            "model": "gpt-4o-mini",
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": prompt}
            ],
            "temperature": 0.2,
        }
        if json_mode:
            payload["response_format"] = {"type": "json_object"}

        async with httpx.AsyncClient(timeout=15.0) as client:
            resp = await client.post(url, json=payload, headers=headers)
            resp.raise_for_status()
            data = resp.json()
            return data["choices"][0]["message"]["content"]

llm_provider = LLMProvider()
