"""
Internal Task model (data layer representation).
"""

from datetime import date, datetime
from typing import Literal, Optional


class Task:
    """
    Represents a student task/assignment.
    """

    def __init__(
        self,
        id: str,
        title: str,
        course: str,
        due_date: date,
        description: Optional[str] = None,
        priority: Literal["low", "medium", "high"] = "medium",
        completed: bool = False,
        created_at: Optional[datetime] = None,
        updated_at: Optional[datetime] = None,
    ) -> None:
        self.id = id
        self.title = title
        self.course = course
        self.due_date = due_date
        self.description = description
        self.priority = priority
        self.completed = completed
        # Default timestamps to now if not provided
        self.created_at = created_at or datetime.utcnow()
        self.updated_at = updated_at or datetime.utcnow()

    def __repr__(self) -> str:
        return f"<Task id={self.id!r} title={self.title!r} course={self.course!r}>"
