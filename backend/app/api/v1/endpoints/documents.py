from fastapi import APIRouter, Depends, HTTPException, Response
from app.api import deps
from app.services.document_service import DocumentService
from app.models.schemas import DownloadRequest
import base64

router = APIRouter()

@router.post("/download")
async def download_document(
    request: DownloadRequest,
    service: DocumentService = Depends(deps.get_document_service)
):
    """
    Generate and download a document (PDF or DOCX).
    """
    try:
        result = service.create_document(request.title, request.content, request.format)
        return result
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
