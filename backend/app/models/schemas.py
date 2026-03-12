from pydantic import BaseModel
from typing import Optional

class TopicRequest(BaseModel):
    profession: str

class PlanRequest(BaseModel):
    topic: str

class WriteRequest(BaseModel):
    topic: str
    outline: dict

class RefineTopicRequest(BaseModel):
    profession: str
    topic_input: str
    current_topic: str

class RefinePlanRequest(BaseModel):
    current_plan: dict
    feedback: str

class WriteSectionRequest(BaseModel):
    section: dict
    topic: str
    context: dict

class PlagiarismRequest(BaseModel):
    content: str

class DownloadRequest(BaseModel):
    title: str
    content: str
    format: str  # "pdf" or "docx"

class SavePaperRequest(BaseModel):
    title: str
    content: str
    author: Optional[str] = "Anonymous"
    user_id: str
    is_public: bool = False
    plagiarism_score: float = 0

class PlagiarismJobRequest(BaseModel):
    paperId: str
    content: str

class HumanizeRequest(BaseModel):
    content: str

class FixIssuesRequest(BaseModel):
    content: str
    analysis: str
    indicators: list
