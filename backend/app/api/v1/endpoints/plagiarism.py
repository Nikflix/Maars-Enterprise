from fastapi import APIRouter, Depends, BackgroundTasks, HTTPException
from app.api import deps
from app.services.plagiarism_service import PlagiarismService
from app.models.schemas import PlagiarismRequest, PlagiarismJobRequest

router = APIRouter()

@router.post("/check")
async def check_plagiarism(
    request: PlagiarismRequest,
    service: PlagiarismService = Depends(deps.get_plagiarism_service)
):
    """
    Synchronous plagiarism check for immediate results.
    """
    return service.check_plagiarism_sync(request.content)

@router.post("/start")
async def start_plagiarism_check(
    request: PlagiarismJobRequest,
    background_tasks: BackgroundTasks,
    service: PlagiarismService = Depends(deps.get_plagiarism_service)
):
    """
    Start an asynchronous plagiarism check job.
    """
    job_id = service.start_job(request.content)
    background_tasks.add_task(service.process_plagiarism_job, job_id, request.content)
    return {"jobId": job_id}

@router.get("/status/{job_id}")
async def get_plagiarism_status(
    job_id: str,
    service: PlagiarismService = Depends(deps.get_plagiarism_service)
):
    """
    Get the status and progress of a plagiarism check job.
    """
    job = service.get_job_status(job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    return {"status": job["status"], "progress": job.get("progress", 0)}

@router.get("/result/{job_id}")
async def get_plagiarism_result(
    job_id: str,
    service: PlagiarismService = Depends(deps.get_plagiarism_service)
):
    """
    Get the final result of a completed plagiarism check job.
    """
    job = service.get_job_status(job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    if job["status"] != "completed":
        raise HTTPException(status_code=400, detail="Job not completed")
    return job.get("result")
