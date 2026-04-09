"""
Task router — defines all /tasks API endpoints.

"""

from typing import Literal, Optional

from fastapi import APIRouter, Query, status

from app.schemas.task import TaskCreate, TaskResponse, TaskUpdate
import app.services.task_service as service

# Create a router with the /tasks prefix and a tag for /docs grouping
router = APIRouter(prefix="/tasks", tags=["Tasks"])


# ---------------------------------------------------------------------------
# GET /tasks
# ---------------------------------------------------------------------------
@router.get(
    "/",
    response_model=list[TaskResponse],
    summary="List all tasks",
    description=(
        "Retrieve all tasks. "
        "Optionally filter by **course**, **completed** status, or **priority**, "
        "search by **keyword**, and sort by **due_date**, **priority**, or **created_at**."
    ),
)
def list_tasks(
    course: Optional[str] = Query(
        default=None,
        description="Filter by course prefix — e.g. 'COMPSCI' matches COMPSCI732, COMPSCI369, etc.",
        examples=["COMPSCI"],
    ),
    completed: Optional[bool] = Query(
        default=None,
        description="Filter by completion status (true / false)",
    ),
    priority: Optional[Literal["low", "medium", "high"]] = Query(
        default=None,
        description="Filter by priority level",
    ),
    search: Optional[str] = Query(
        default=None,
        description="Keyword search across title and description",
        examples=["report"],
    ),
    sort_by: Optional[Literal["due_date", "priority", "created_at"]] = Query(
        default=None,
        description="Sort results by this field",
    ),
):
    """
    Return a list of tasks.
    """
    tasks = service.list_tasks(
        course=course,
        completed=completed,
        priority=priority,
        search=search,
        sort_by=sort_by,
    )
    # Convert internal Task objects to response schema
    return [TaskResponse.model_validate(t.__dict__) for t in tasks]


# ---------------------------------------------------------------------------
# GET /tasks/upcoming  (must be defined BEFORE /tasks/{task_id})
# ---------------------------------------------------------------------------
@router.get(
    "/upcoming",
    response_model=list[TaskResponse],
    summary="Get upcoming tasks",
    description="Return incomplete tasks due within the next 7 days, sorted by due date.",
)
def get_upcoming_tasks():
    """
    Upcoming tasks due in the next 7 days.
    """
    tasks = service.get_upcoming_tasks(days=7)
    return [TaskResponse.model_validate(t.__dict__) for t in tasks]


# ---------------------------------------------------------------------------
# GET /tasks/stats
# ---------------------------------------------------------------------------
@router.get(
    "/stats",
    summary="Get task statistics",
    description="Return a summary of all tasks: totals, completion rate, and breakdown by priority.",
)
def get_stats():
    """
    Task summary statistics.
    """
    return service.get_stats()


# ---------------------------------------------------------------------------
# GET /tasks/{task_id}
# ---------------------------------------------------------------------------
@router.get(
    "/{task_id}",
    response_model=TaskResponse,
    summary="Get a single task",
    description="Retrieve a task by its unique ID. Returns 404 if not found.",
)
def get_task(task_id: str):
    """
    Fetch one task by ID.
    """
    task = service.get_task(task_id)
    return TaskResponse.model_validate(task.__dict__)


# ---------------------------------------------------------------------------
# POST /tasks
# ---------------------------------------------------------------------------
@router.post(
    "/",
    response_model=TaskResponse,
    status_code=status.HTTP_201_CREATED,   # Return 201 Created on success
    summary="Create a new task",
    description=(
        "Create a new student task. "
        "FastAPI automatically validates the request body against the **TaskCreate** schema."
    ),
)
def create_task(data: TaskCreate):
    """
    Create a task with validated input.
    """
    task = service.create_task(data)
    return TaskResponse.model_validate(task.__dict__)


# ---------------------------------------------------------------------------
# PUT /tasks/{task_id}
# ---------------------------------------------------------------------------
@router.put(
    "/{task_id}",
    response_model=TaskResponse,
    summary="Update a task",
    description=(
        "Update an existing task. "
        "All fields are **optional** — only the fields you include will be updated."
    ),
)
def update_task(task_id: str, data: TaskUpdate):
    """
    Partial update of a task.
    """
    task = service.update_task(task_id, data)
    return TaskResponse.model_validate(task.__dict__)


# ---------------------------------------------------------------------------
# DELETE /tasks/{task_id}
# ---------------------------------------------------------------------------
@router.delete(
    "/{task_id}",
    status_code=status.HTTP_204_NO_CONTENT,  # No response body on delete
    summary="Delete a task",
    description="Delete a task by its ID. Returns 204 No Content on success.",
)
def delete_task(task_id: str):
    """
    Delete a task by ID.
    """
    service.delete_task(task_id)
