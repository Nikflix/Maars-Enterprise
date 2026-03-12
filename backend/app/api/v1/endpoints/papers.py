from typing import List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException

from app.api import deps
from app.repositories.paper_repository import PaperRepository
from app.models.schemas import SavePaperRequest
from datetime import datetime
import uuid

router = APIRouter()

@router.get("/papers", response_model=List[Dict[str, Any]])
async def get_papers(
    repo: PaperRepository = Depends(deps.get_paper_repository)
):
    return repo.get_all()

@router.post("/papers")
async def save_paper(
    request: SavePaperRequest,
    repo: PaperRepository = Depends(deps.get_paper_repository)
):
    paper = {
        "id": str(uuid.uuid4()),
        "title": request.title,
        "content": request.content,
        "author": request.author,
        "user_id": request.user_id,
        "is_public": request.is_public,
        "plagiarism_score": request.plagiarism_score,
        "created_at": datetime.now().isoformat(),
    }
    return repo.create(paper)

@router.patch("/papers/{paper_id}/publish")
async def publish_paper(
    paper_id: str,
    repo: PaperRepository = Depends(deps.get_paper_repository)
):
    updated = repo.update(paper_id, {"is_public": True})
    if updated:
        return updated
    raise HTTPException(status_code=404, detail="Paper not found")

@router.patch("/papers/{paper_id}/unpublish")
async def unpublish_paper(
    paper_id: str,
    repo: PaperRepository = Depends(deps.get_paper_repository)
):
    updated = repo.update(paper_id, {"is_public": False})
    if updated:
        return updated
    raise HTTPException(status_code=404, detail="Paper not found")

@router.delete("/papers/{paper_id}")
async def delete_paper(
    paper_id: str,
    repo: PaperRepository = Depends(deps.get_paper_repository)
):
    success = repo.delete(paper_id)
    if success:
        return {"status": "deleted"}
    else:
        raise HTTPException(status_code=500, detail="Failed to delete paper")

@router.get("/stats")
async def get_stats(
    repo: PaperRepository = Depends(deps.get_paper_repository)
):
    papers = repo.get_all()
    return {
        "total_papers": len(papers),
        "compliant_percentage": 98,
        "avg_time": "<2m"
    }
