"""
Tests for the Student Task Manager API.

"""

import pytest
from fastapi.testclient import TestClient

from app.main import app
import app.storage.in_memory as store

# Create a test client from the FastAPI app
client = TestClient(app, raise_server_exceptions=True)

# ---------------------------------------------------------------------------
# Helper — a valid task payload used across multiple tests
# ---------------------------------------------------------------------------
VALID_TASK = {
    "title": "Test Assignment",
    "description": "A test task for unit testing",
    "course": "COMPSCI732",
    "due_date": "2026-12-01",
    "priority": "high",
    "completed": False,
}


@pytest.fixture(autouse=True)
def reset_store():
    """
    Clear the in-memory store before each test.
    """
    store.clear()
    yield
    store.clear()


# ---------------------------------------------------------------------------
# Test: Health check
# ---------------------------------------------------------------------------
def test_health_check():
    response = client.get("/")
    assert response.status_code == 200
    assert response.json()["status"] == "ok"


# ---------------------------------------------------------------------------
# Test: Create task (POST /tasks/)
# ---------------------------------------------------------------------------
def test_create_task_success():
    """Creating a task with valid data should return 201 and the full task object."""
    response = client.post("/tasks/", json=VALID_TASK)
    assert response.status_code == 201

    body = response.json()
    assert body["title"] == VALID_TASK["title"]
    assert body["course"] == "COMPSCI732"
    assert body["priority"] == "high"
    assert body["completed"] is False
    # Server should have generated id and timestamps
    assert "id" in body
    assert "created_at" in body
    assert "updated_at" in body


def test_create_task_missing_required_field():
    """Omitting a required field (course) should return 422 Unprocessable Entity."""
    bad_payload = {k: v for k, v in VALID_TASK.items() if k != "course"}
    response = client.post("/tasks/", json=bad_payload)
    assert response.status_code == 422


def test_create_task_invalid_priority():
    """Sending an invalid priority value should return 422."""
    bad_payload = {**VALID_TASK, "priority": "urgent"}
    response = client.post("/tasks/", json=bad_payload)
    assert response.status_code == 422


def test_create_task_empty_title():
    """An empty title should fail validation (min_length=1)."""
    bad_payload = {**VALID_TASK, "title": ""}
    response = client.post("/tasks/", json=bad_payload)
    assert response.status_code == 422


# ---------------------------------------------------------------------------
# Test: List tasks (GET /tasks/)
# ---------------------------------------------------------------------------
def test_list_tasks_empty():
    """When no tasks exist, the list should be empty."""
    response = client.get("/tasks/")
    assert response.status_code == 200
    assert response.json() == []


def test_list_tasks_returns_created_tasks():
    """Tasks created via POST should appear in the list."""
    client.post("/tasks/", json=VALID_TASK)
    client.post("/tasks/", json={**VALID_TASK, "title": "Second Task"})

    response = client.get("/tasks/")
    assert response.status_code == 200
    assert len(response.json()) == 2


def test_list_tasks_filter_by_course():
    """Filter by course should only return matching tasks."""
    client.post("/tasks/", json=VALID_TASK)  # COMPSCI732
    client.post("/tasks/", json={**VALID_TASK, "course": "SOFTENG750"})

    response = client.get("/tasks/?course=COMPSCI732")
    assert response.status_code == 200
    tasks = response.json()
    assert len(tasks) == 1
    assert tasks[0]["course"] == "COMPSCI732"


def test_list_tasks_filter_by_completed():
    """Filter by completed=true should only return completed tasks."""
    client.post("/tasks/", json=VALID_TASK)  # completed=False
    client.post("/tasks/", json={**VALID_TASK, "title": "Done Task", "completed": True})

    response = client.get("/tasks/?completed=true")
    assert response.status_code == 200
    tasks = response.json()
    assert all(t["completed"] is True for t in tasks)


# ---------------------------------------------------------------------------
# Test: Get single task (GET /tasks/{id})
# ---------------------------------------------------------------------------
def test_get_task_success():
    """Getting a task by a valid ID should return 200 with the task."""
    create_resp = client.post("/tasks/", json=VALID_TASK)
    task_id = create_resp.json()["id"]

    response = client.get(f"/tasks/{task_id}")
    assert response.status_code == 200
    assert response.json()["id"] == task_id


def test_get_task_not_found():
    """Requesting a non-existent task ID should return 404."""
    response = client.get("/tasks/nonexistent-id")
    assert response.status_code == 404


# ---------------------------------------------------------------------------
# Test: Update task (PUT /tasks/{id})
# ---------------------------------------------------------------------------
def test_update_task_success():
    """Updating a task's title and completed status should reflect in the response."""
    create_resp = client.post("/tasks/", json=VALID_TASK)
    task_id = create_resp.json()["id"]

    update_payload = {"title": "Updated Title", "completed": True}
    response = client.put(f"/tasks/{task_id}", json=update_payload)

    assert response.status_code == 200
    body = response.json()
    assert body["title"] == "Updated Title"
    assert body["completed"] is True
    # Fields not in update payload should remain unchanged
    assert body["course"] == VALID_TASK["course"]


def test_update_task_not_found():
    """Updating a non-existent task should return 404."""
    response = client.put("/tasks/nonexistent-id", json={"title": "X"})
    assert response.status_code == 404


# ---------------------------------------------------------------------------
# Test: Delete task (DELETE /tasks/{id})
# ---------------------------------------------------------------------------
def test_delete_task_success():
    """Deleting a task should return 204 and the task should no longer exist."""
    create_resp = client.post("/tasks/", json=VALID_TASK)
    task_id = create_resp.json()["id"]

    delete_resp = client.delete(f"/tasks/{task_id}")
    assert delete_resp.status_code == 204

    # Confirm it is gone
    get_resp = client.get(f"/tasks/{task_id}")
    assert get_resp.status_code == 404


def test_delete_task_not_found():
    """Deleting a non-existent task should return 404."""
    response = client.delete("/tasks/nonexistent-id")
    assert response.status_code == 404


# ---------------------------------------------------------------------------
# Test: Stats endpoint (GET /tasks/stats)
# ---------------------------------------------------------------------------
def test_get_stats_empty():
    """Stats with no tasks should show all zeros."""
    response = client.get("/tasks/stats")
    assert response.status_code == 200
    body = response.json()
    assert body["total"] == 0
    assert body["completed"] == 0
    assert body["completion_rate"] == 0.0


def test_get_stats_with_tasks():
    """Stats should reflect the correct counts after creating tasks."""
    client.post("/tasks/", json=VALID_TASK)
    client.post("/tasks/", json={**VALID_TASK, "title": "Done", "completed": True})

    response = client.get("/tasks/stats")
    assert response.status_code == 200
    body = response.json()
    assert body["total"] == 2
    assert body["completed"] == 1
    assert body["pending"] == 1
    assert body["completion_rate"] == 50.0
