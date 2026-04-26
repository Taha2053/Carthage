"""
Services — OCR Service (API-based)
Sends images/documents to an external OCR API (e.g., a hosted PaddleOCR instance)
instead of running heavy models locally.
"""
from __future__ import annotations

import logging
import httpx
from typing import Optional

logger = logging.getLogger(__name__)

class OCRService:
    def __init__(self):
        # In a real hackathon, you'd put these in .env
        self.api_url = "https://api.ocr.space/parse/image"
        # Free API key for OCR.space as a fallback
        self.api_key = "helloworld" 

    async def extract_text(self, content: bytes, filename: str) -> Optional[str]:
        """
        Sends the file bytes to an OCR API and returns the extracted text.
        """
        logger.info(f"[OCR] Sending {filename} to OCR API...")
        
        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                files = {"file": (filename, content, "application/octet-stream")}
                data = {
                    "apikey": self.api_key,
                    "language": "fre", # French for UCAR
                    "isOverlayRequired": False
                }
                
                response = await client.post(self.api_url, files=files, data=data)
                response.raise_for_status()
                
                result = response.json()
                
                if result.get("IsErroredOnProcessing"):
                    logger.error(f"[OCR] API Error: {result.get('ErrorMessage')}")
                    return None
                
                # Combine all extracted lines
                extracted_text = []
                for parsed_result in result.get("ParsedResults", []):
                    extracted_text.append(parsed_result.get("ParsedText", ""))
                
                final_text = "\n".join(extracted_text).strip()
                logger.info(f"[OCR] Extracted {len(final_text)} characters.")
                return final_text
                
        except Exception as e:
            logger.error(f"[OCR] Failed to connect to OCR API: {e}")
            return None

ocr_service = OCRService()
