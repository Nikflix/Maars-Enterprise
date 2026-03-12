from fastapi import APIRouter, Depends, BackgroundTasks, HTTPException
from app.api import deps
from app.services.humanizer_service import HumanizerService
from app.models.schemas import HumanizeRequest, FixIssuesRequest

router = APIRouter()

@router.post("/start")
async def start_humanize(
    request: HumanizeRequest,
    background_tasks: BackgroundTasks,
    service: HumanizerService = Depends(deps.get_humanizer_service)
):
    """Start an async humanization job."""
    job_id = service.start_job(request.content)
    background_tasks.add_task(service.process_humanize_job, job_id, request.content)
    return {"jobId": job_id}

@router.post("/fix")
async def fix_issues(
    request: FixIssuesRequest,
    background_tasks: BackgroundTasks,
    service: HumanizerService = Depends(deps.get_humanizer_service)
):
    """Start a targeted fix job based on content analysis results."""
    job_id = service.start_job(request.content)
    background_tasks.add_task(
        service.process_fix_job, job_id, request.content, request.analysis, request.indicators
    )
    return {"jobId": job_id}

@router.get("/status/{job_id}")
async def get_humanize_status(
    job_id: str,
    service: HumanizerService = Depends(deps.get_humanizer_service)
):
    """Get status and progress of a humanization job."""
    job = service.get_job_status(job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    return {"status": job["status"], "progress": job.get("progress", 0)}

@router.get("/result/{job_id}")
async def get_humanize_result(
    job_id: str,
    service: HumanizerService = Depends(deps.get_humanizer_service)
):
    """Get the final result of a completed humanization job."""
    job = service.get_job_status(job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    if job["status"] != "completed":
        raise HTTPException(status_code=400, detail="Job not completed")
    return job.get("result")
