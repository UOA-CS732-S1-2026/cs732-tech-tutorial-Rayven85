"""
Pydantic schemas for request validation and response serialisation.

"""

from datetime import date, datetime
from typing import Literal, Optional

from pydantic import BaseModel, ConfigDict, Field


class TaskCreate(BaseModel):
    """
    Schema for creating a new task (POST /tasks).
    """

    title: str = Field(
        ...,
        min_length=1,
        max_length=200,
        description="Task title",
        examples=["COMPSCI732 Tech Tutorial Report"],
    )
    description: Optional[str] = Field(
        default=None,
        max_length=1000,
        description="Optional longer description of the task",
        examples=["Write a 2000-word tutorial report on FastAPI"],
    )
    course: str = Field(
        ...,
        min_length=1,
        max_length=50,
        description="Course code this task belongs to",
        examples=["COMPSCI732"],
    )
    due_date: date = Field(
        ...,
        description="Due date in ISO format (YYYY-MM-DD)",
        examples=["2026-05-01"],
    )
    priority: Literal["low", "medium", "high"] = Field(
        default="medium",
        description="Task priority level",
        examples=["high"],
    )
    completed: bool = Field(
        default=False,
        description="Whether the task is completed",
    )


class TaskUpdate(BaseModel):
    """
    Schema for updating an existing task (PUT /tasks/{task_id}).
    """

    title: Optional[str] = Field(default=None, min_length=1, max_length=200)
    description: Optional[str] = Field(default=None, max_length=1000)
    course: Optional[str] = Field(default=None, min_length=1, max_length=50)
    due_date: Optional[date] = None
    priority: Optional[Literal["low", "medium", "high"]] = None
    completed: Optional[bool] = None


class TaskResponse(BaseModel):
    """
    Schema for task responses returned to the client.
    """

    # Allow building from plain objects (not just dicts)
    model_config = ConfigDict(from_attributes=True)

    id: str
    title: str
    description: Optional[str]
    course: str
    due_date: date
    priority: Literal["low", "medium", "high"]
    completed: bool
    created_at: datetime
    updated_at: datetime
