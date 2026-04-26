"""
Services — RAG Agent
Retrieves relevant documents via pgvector similarity search,
then synthesises an answer using an LLM.
"""
from __future__ import annotations

import logging
from typing import Any, Dict, List, Optional


from core.llm import call_llm, get_embedding

logger = logging.getLogger(__name__)

_RAG_SYSTEM = (
    "You are an expert assistant for the University of Carthage (UCAR) network. "
    "Answer questions accurately and concisely using ONLY the provided context. "
    "If the context does not contain enough information, say so clearly. "
    "Never invent data."
)


async def retrieve_documents(
    db: AsyncClient,
    query: str,
    institution_id: Optional[int] = None,
    match_count: int = 5,
) -> List[Dict[str, Any]]:
    """
    Embeds the query and calls the match_documents RPC in Supabase
    to perform cosine similarity search against the documents table.
    """
    query_embedding = await get_embedding(query)

    params: Dict[str, Any] = {
        "query_embedding": query_embedding,
        "match_count": match_count,
        "filter_institution_id": institution_id,
    }

    result = await db.rpc("match_documents", params).execute()
    return result.data or []


async def rag_agent(
    query: str,
    db: AsyncClient,
    institution_id: Optional[int] = None,
) -> Dict[str, Any]:
    """
    Full RAG pipeline:
    1. Embed the query
    2. Retrieve top-k similar document chunks
    3. Build a context-augmented prompt
    4. Call the LLM for the final answer
    """
    docs = await retrieve_documents(db, query, institution_id)

    if not docs:
        return {
            "answer": (
                "I could not find any relevant documents to answer your question. "
                "Please ensure documents have been uploaded and indexed for this institution."
            ),
            "sources": [],
        }

    # Build context block
    context_parts = []
    for i, doc in enumerate(docs, 1):
        source = doc.get("source") or "Unknown source"
        title = doc.get("title") or f"Document {i}"
        content = doc.get("content", "")
        similarity = doc.get("similarity", 0)
        context_parts.append(
            f"[{i}] {title} (source: {source}, relevance: {similarity:.2f})\n{content}"
        )

    context = "\n\n---\n\n".join(context_parts)

    prompt = f"""Use the following documents to answer the question.

DOCUMENTS:
{context}

QUESTION:
{query}

Provide a clear, structured answer. Cite document numbers (e.g. [1], [2]) where relevant."""

    answer = await call_llm(prompt, system=_RAG_SYSTEM)

    return {
        "answer": answer,
        "sources": docs,
    }
