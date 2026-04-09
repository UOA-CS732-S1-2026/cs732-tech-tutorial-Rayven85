"""
FastAPI application entry point.
"""

from contextlib import asynccontextmanager
from datetime import date, datetime

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routers.tasks import router as tasks_router
import app.storage.in_memory as store
from app.models.task import Task


# ---------------------------------------------------------------------------
# Seed data — pre-populated on startup for demo convenience
# ---------------------------------------------------------------------------
SEED_TASKS = [
    Task(
        id="demo-001",
        course="COMPSCI732",
        title="Tech Tutorial Report",
        description="Write a 2000-word tutorial report on a chosen framework and record a short demo video.",
        due_date=date(2026, 5, 1),
        priority="high",
        completed=False,
        created_at=datetime(2026, 4, 1, 9, 0, 0),
        updated_at=datetime(2026, 4, 1, 9, 0, 0),
    ),
    Task(
        id="demo-002",
        course="SOFTENG750",
        title="Final Project",
        description="Implement the full-stack web application and submit the group report.",
        due_date=date(2026, 5, 20),
        priority="high",
        completed=False,
        created_at=datetime(2026, 4, 2, 10, 0, 0),
        updated_at=datetime(2026, 4, 2, 10, 0, 0),
    ),
    Task(
        id="demo-003",
        course="COMPSCI369",
        title="Assignment 2",
        description="Solve the dynamic programming problem set.",
        due_date=date(2026, 4, 15),
        priority="medium",
        completed=True,
        created_at=datetime(2026, 3, 20, 8, 0, 0),
        updated_at=datetime(2026, 4, 3, 14, 0, 0),
    ),
    Task(
        id="demo-004",
        course="DIGIHLTH705",
        title="Assignment 2",
        description=(
            "Record a video presentation of a proposed digital health tool to meet a specified community need. "
            "The presentation must address ethical and cultural considerations (LO2) and explain how the tool "
            "can reduce health inequities (LO3). Individual assessment. Weighting: 25% of final grade."
        ),
        due_date=date(2026, 5, 11),
        priority="high",
        completed=False,
        created_at=datetime(2026, 4, 5, 10, 0, 0),
        updated_at=datetime(2026, 4, 5, 10, 0, 0),
    ),
    Task(
        id="demo-005",
        course="INFOSYS711",
        title="In-class Quiz",
        description=(
            "Closed-book in-class quiz covering weeks 1–6 lecture material. "
            "Topics include enterprise systems, data governance, and digital transformation frameworks. "
            "Bring your student ID. Duration: 45 minutes."
        ),
        due_date=date(2026, 4, 28),
        priority="low",
        completed=False,
        created_at=datetime(2026, 4, 6, 8, 30, 0),
        updated_at=datetime(2026, 4, 6, 8, 30, 0),
    ),
    Task(
        id="demo-006",
        course="COMPSYS722",
        title="Assignment 2",
        description=(
            "Design and implement an embedded control system for a DC motor speed controller. "
            "Submit the circuit schematic, firmware source code, and a written report analysing "
            "system performance under varying load conditions. Weighting: 20% of final grade."
        ),
        due_date=date(2026, 5, 8),
        priority="medium",
        completed=False,
        created_at=datetime(2026, 4, 4, 14, 0, 0),
        updated_at=datetime(2026, 4, 4, 14, 0, 0),
    ),
]


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Runs on application startup: seeds the in-memory store with demo tasks.
    """
    for task in SEED_TASKS:
        store.add(task)
    yield  # Application runs here
    # (Shutdown logic could go here if needed)


# ---------------------------------------------------------------------------
# Create the FastAPI application instance
# ---------------------------------------------------------------------------
app = FastAPI(
    title="Student Task Manager API",
    description=(
        "A RESTful API for managing student assignments and tasks. "
        "Built with **FastAPI** to demonstrate automatic request validation, "
        "Pydantic schemas, and auto-generated OpenAPI documentation.\n\n"
        "**Tutorial project for COMPSCI732 — University of Auckland**"
    ),
    version="1.0.0",
    lifespan=lifespan,
)

# ---------------------------------------------------------------------------
# CORS — allow the React frontend (localhost:5173) to call this API
# Without this, browsers block cross-origin requests by default.
# ---------------------------------------------------------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # Vite dev server origin / Vite
    allow_methods=["*"],   # Allow GET, POST, PUT, DELETE etc.
    allow_headers=["*"],   # Allow all request headers
)

# Register the tasks router
app.include_router(tasks_router)


# ---------------------------------------------------------------------------
# Health check endpoint
# ---------------------------------------------------------------------------
@app.get("/", tags=["Health"], summary="Health check")
def health_check():
    """
    Returns a simple message confirming the API is running.
    """
    return {
        "status": "ok",
        "message": "Student Task Manager API is running.",
        "docs": "/docs",
    }
