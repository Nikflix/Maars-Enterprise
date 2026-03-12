from fastapi import APIRouter, Depends
from fastapi.responses import StreamingResponse
from app.api import deps
from app.services.research_service import ResearchService
from app.models.schemas import TopicRequest, PlanRequest, WriteRequest, RefineTopicRequest, RefinePlanRequest, WriteSectionRequest

router = APIRouter()

@router.post("/suggest_topics")
async def suggest_topics(
    request: TopicRequest,
    service: ResearchService = Depends(deps.get_research_service)
):
    return await service.suggest_topics(request.profession)

@router.post("/plan_research")
async def plan_research(
    request: PlanRequest,
    service: ResearchService = Depends(deps.get_research_service)
):
    return await service.plan_research(request.topic)

@router.post("/plan")
async def plan_research_alias(
    request: PlanRequest,
    service: ResearchService = Depends(deps.get_research_service)
):
    return await service.plan_research(request.topic)

@router.post("/refine-topic")
async def refine_topic(
    request: RefineTopicRequest,
    service: ResearchService = Depends(deps.get_research_service)
):
    return await service.refine_topic(request.profession, request.topic_input, request.current_topic)

@router.post("/refine-plan")
async def refine_plan(
    request: RefinePlanRequest,
    service: ResearchService = Depends(deps.get_research_service)
):
    return await service.refine_plan(request.current_plan, request.feedback)

@router.post("/write_paper")
async def write_paper(
    request: WriteRequest,
    service: ResearchService = Depends(deps.get_research_service)
):
    return StreamingResponse(
        service.generate_paper(request.topic, request.outline),
        media_type="text/event-stream"
    )

@router.post("/write-section")
async def write_section(
    request: WriteSectionRequest,
    service: ResearchService = Depends(deps.get_research_service)
):
    return StreamingResponse(
        service.write_section(request.topic, request.section),
        media_type="text/plain"
    )
