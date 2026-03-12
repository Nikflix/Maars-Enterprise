from typing import Generator
from fastapi import Depends

from app.repositories.paper_repository import PaperRepository
from app.services.research_service import ResearchService
from app.services.document_service import DocumentService
from app.services.plagiarism_service import PlagiarismService, get_plagiarism_service_instance
from app.services.humanizer_service import HumanizerService, get_humanizer_service_instance

def get_paper_repository() -> Generator[PaperRepository, None, None]:
    """Dependency provider for PaperRepository."""
    yield PaperRepository()

def get_research_service() -> Generator[ResearchService, None, None]:
    """Dependency provider for ResearchService."""
    yield ResearchService()

def get_document_service() -> Generator[DocumentService, None, None]:
    """Dependency provider for DocumentService."""
    yield DocumentService()

def get_plagiarism_service(
    research_service: ResearchService = Depends(get_research_service)
) -> Generator[PlagiarismService, None, None]:
    """Dependency provider for PlagiarismService (Singleton)."""
    # In a real app we might use lru_cache for singletons or a proper DI container
    yield get_plagiarism_service_instance(research_service)

def get_humanizer_service() -> Generator[HumanizerService, None, None]:
    """Dependency provider for HumanizerService (Singleton)."""
    yield get_humanizer_service_instance()
