"""
In-memory storage for tasks.
"""

from typing import Optional
from app.models.task import Task

# The main data store: a dict mapping task ID -> Task object
_tasks: dict[str, Task] = {}


def get_all() -> list[Task]:
    """Return all tasks as a list."""
    return list(_tasks.values())


def get_by_id(task_id: str) -> Optional[Task]:
    """Return a single task by ID, or None if not found."""
    return _tasks.get(task_id)


def add(task: Task) -> Task:
    """Insert a new task into the store."""
    _tasks[task.id] = task
    return task


def update(task: Task) -> Task:
    """Overwrite an existing task entry."""
    _tasks[task.id] = task
    return task


def delete(task_id: str) -> None:
    """Remove a task from the store by ID."""
    _tasks.pop(task_id, None)


def clear() -> None:
    """Remove all tasks — used in tests to reset state."""
    _tasks.clear()
