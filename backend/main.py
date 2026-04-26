"""FastAPI application for CARTHAGE."""

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from core.config import settings
from core.database import supabase


app = FastAPI(
    title=settings.APP_NAME,
    debug=settings.DEBUG,
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.middleware("http")
async def add_process_time_header(request: Request, call_next):
    """Add processing time header."""
    response = await call_next(request)
    return response


def verify_auth(token: str) -> bool:
    """Verify Bearer token with Supabase auth."""
    try:
        result = supabase.auth.get_user(token)
        return result.user is not None
    except Exception:
        return False


@app.get("/")
def root():
    """Health check endpoint."""
    return {"status": "ok", "app": settings.APP_NAME}


@app.get("/health")
def health():
    """Health check endpoint."""
    return {"status": "healthy"}


# Import and register routers
from api.ingest import router as ingest_router
from api.router import api_router

app.include_router(ingest_router)
app.include_router(api_router)