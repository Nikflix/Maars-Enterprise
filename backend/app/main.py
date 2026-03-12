import logging
import time

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.core import config
from app.api.v1.api import api_router

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger(__name__)

def create_application() -> FastAPI:
    application = FastAPI(
        title="MAARS Enterprise API",
        version="2.0.0",
        description="Multi-Agent Autonomous Research System Enterprise Backend",
    )

    # CORS Configuration
    application.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],  # In production, specify exact origins
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # Request Logging Middleware
    @application.middleware("http")
    async def log_requests(request: Request, call_next):
        start_time = time.time()
        response = await call_next(request)
        process_time = (time.time() - start_time) * 1000
        logger.info(
            f"{request.method} {request.url.path} - Status: {response.status_code} - Time: {process_time:.2f}ms"
        )
        return response

    # Global Exception Handler
    @application.exception_handler(Exception)
    async def global_exception_handler(request: Request, exc: Exception):
        logger.error(f"Global exception: {exc}", exc_info=True)
        return JSONResponse(
            status_code=500,
            content={"detail": "Internal Server Error"},
        )

    # Include Router
    # We mount the API router at root for backward compatibility with frontend, 
    # but logically it belongs under /api/v1.
    # The frontend expects /suggest_topics, etc. directly at root.
    # So we'll include it directly.
    application.include_router(api_router)

    @application.get("/")
    async def root():
        return {"message": "MAARS Enterprise API is running (OOP Architecture)"}

    return application

app = create_application()
