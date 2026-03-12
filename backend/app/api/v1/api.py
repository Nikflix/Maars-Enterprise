from fastapi import APIRouter
from app.api.v1.endpoints import research, papers, plagiarism, documents, humanize

api_router = APIRouter()

api_router.include_router(research.router, tags=["research"])
api_router.include_router(papers.router, tags=["papers"])
api_router.include_router(plagiarism.router, prefix="/api/plagiarism", tags=["plagiarism"])
api_router.include_router(humanize.router, prefix="/api/humanize", tags=["humanize"])
api_router.include_router(documents.router, tags=["documents"])
