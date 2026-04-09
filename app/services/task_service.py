"""
Business logic for task operations.
"""

from datetime import date, datetime, timedelta
from typing import Literal, Optional
from uuid import uuid4

from fastapi import HTTPException, status

from app.models.task import Task
from app.schemas.task import TaskCreate, TaskUpdate
import app.storage.in_memory as store

# Priority ordering used when sorting
PRIORITY_ORDER: dict[str, int] = {"low": 0, "medium": 1, "high": 2}


def list_tasks(
    course: Optional[str] = None,
    completed: Optional[bool] = None,
    priority: Optional[Literal["low", "medium", "high"]] = None,
    search: Optional[str] = None,
    sort_by: Optional[Literal["due_date", "priority", "created_at"]] = None,
) -> list[Task]:
    """
    Return all tasks, optionally filtered and sorted.
    """
    tasks = store.get_all()

    # Filter by course prefix (case-insensitive) — e.g. "COMPSCI" matches "COMPSCI732"
    if course is not None:
        tasks = [t for t in tasks if t.course.upper().startswith(course.upper())]

    # Filter by completion status
    if completed is not None:
        tasks = [t for t in tasks if t.completed == completed]

    # Filter by priority level
    if priority is not None:
        tasks = [t for t in tasks if t.priority == priority]

    # Keyword search across course, title, and description
    if search is not None:
        keyword = search.lower()
        tasks = [
            t for t in tasks
            if keyword in t.course.lower()
            or keyword in t.title.lower()
            or (t.description and keyword in t.description.lower())
        ]

    # Sort results
    if sort_by == "due_date":
        tasks.sort(key=lambda t: t.due_date)
    elif sort_by == "priority":
        # Sort high → medium → low
        tasks.sort(key=lambda t: PRIORITY_ORDER[t.priority], reverse=True)
    elif sort_by == "created_at":
        tasks.sort(key=lambda t: t.created_at)

    return tasks


def get_task(task_id: str) -> Task:
    """
    Fetch a single task by ID. Raises 404 if not found.
    """
    task = store.get_by_id(task_id)
    if task is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Task with id '{task_id}' not found.",
        )
    return task


def create_task(data: TaskCreate) -> Task:
    """
    Create a new task from validated input data.
    """
    now = datetime.utcnow()
    task = Task(
        id=str(uuid4()),          # Generate a unique ID
        title=data.title,
        description=data.description,
        course=data.course,
        due_date=data.due_date,
        priority=data.priority,
        completed=data.completed,
        created_at=now,
        updated_at=now,
    )
    return store.add(task)


def update_task(task_id: str, data: TaskUpdate) -> Task:
    """
    Apply a partial update to an existing task.
    """
    task = get_task(task_id)  # Will raise 404 if missing

    # Only update fields that were explicitly provided in the request body
    if data.title is not None:
        task.title = data.title
    if data.description is not None:
        task.description = data.description
    if data.course is not None:
        task.course = data.course
    if data.due_date is not None:
        task.due_date = data.due_date
    if data.priority is not None:
        task.priority = data.priority
    if data.completed is not None:
        task.completed = data.completed

    task.updated_at = datetime.utcnow()  # Refresh updated timestamp
    return store.update(task)


def delete_task(task_id: str) -> None:
    """
    Delete a task by ID. Raises 404 if not found.
    """
    get_task(task_id)  # Validate existence first
    store.delete(task_id)


def get_upcoming_tasks(days: int = 7) -> list[Task]:
    """
    Return tasks due within the next `days` days (incomplete only).
    """
    today = date.today()
    cutoff = today + timedelta(days=days)

    upcoming = [
        t for t in store.get_all()
        if not t.completed and today <= t.due_date <= cutoff
    ]
    # Sort by due date ascending
    upcoming.sort(key=lambda t: t.due_date)
    return upcoming


def get_stats() -> dict:
    """
    Return a summary of all tasks.
    """
    tasks = store.get_all()
    total = len(tasks)
    completed = sum(1 for t in tasks if t.completed)
    pending = total - completed

    # Count by priority level
    by_priority = {"low": 0, "medium": 0, "high": 0}
    for t in tasks:
        by_priority[t.priority] += 1

    # Collect unique course codes
    courses = sorted({t.course for t in tasks})

    return {
        "total": total,
        "completed": completed,
        "pending": pending,
        "completion_rate": round(completed / total * 100, 1) if total > 0 else 0.0,
        "by_priority": by_priority,
        "courses": courses,
    }
