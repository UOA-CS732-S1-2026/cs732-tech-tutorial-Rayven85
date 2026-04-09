/**
 * App — root component, manages global state.
 *
 * Search is intentionally separated from API filters:
 * - Course / priority / completed / sort_by → call the API
 * - Search term → filter locally from already-loaded tasks (instant, no flicker)
 *
 */
import { useEffect, useState, useMemo } from "react";
import { ExternalLink } from "lucide-react";
import {
  fetchTasks, fetchStats, fetchUpcoming,
  createTask, toggleComplete, deleteTask, updateTask,
} from "./api";
import StatsCards  from "./components/StatsCards";
import FilterBar   from "./components/FilterBar";
import TaskList    from "./components/TaskList";
import AddTaskForm from "./components/AddTaskForm";
import TaskModal   from "./components/TaskModal";

// API-driven filters (each change triggers a fetch)
const EMPTY_API_FILTERS = { course: "", priority: "", completed: "", sort_by: "" };

// Local search filter — matches course code, title, or description
function localSearch(tasks, term) {
  if (!term.trim()) return tasks;
  const kw = term.toLowerCase();
  return tasks.filter((t) =>
    t.course.toLowerCase().includes(kw) ||
    t.title.toLowerCase().includes(kw) ||
    (t.description && t.description.toLowerCase().includes(kw))
  );
}

export default function App() {
  const [tasks,        setTasks]        = useState([]);
  const [upcoming,     setUpcoming]     = useState([]);
  const [stats,        setStats]        = useState(null);
  const [apiFilters,   setApiFilters]   = useState(EMPTY_API_FILTERS);
  const [searchTerm,   setSearchTerm]   = useState("");       // local search
  const [selectedTask, setSelectedTask] = useState(null);
  const [error,        setError]        = useState("");
  const [loading,      setLoading]      = useState(true);

  useEffect(() => { loadAll(EMPTY_API_FILTERS); }, []);

  async function loadAll(filters) {
    setLoading(true);
    setError("");
    try {
      const [taskData, statsData, upcomingData] = await Promise.all([
        fetchTasks(filters),      // search param NOT passed — handled locally
        fetchStats(),
        fetchUpcoming(),
      ]);
      setTasks(taskData);
      setStats(statsData);
      setUpcoming(upcomingData);
    } catch {
      setError("Could not connect to the API. Is the FastAPI backend running on port 8000?");
    } finally {
      setLoading(false);
    }
  }

  // Only API filters trigger a fetch; search is purely local

  function handleApiFilterChange(newFilters) {
    setApiFilters(newFilters);
    loadAll(newFilters);
  }

  // Apply local search on top of API results — no API call needed

  const visibleTasks = useMemo(
    () => localSearch(tasks, searchTerm),
    [tasks, searchTerm]
  );

  async function handleCreate(formData) {
    await createTask(formData);
    await loadAll(apiFilters);
  }

  async function handleToggle(taskId, currentCompleted) {
    // Optimistic update
    setTasks((prev) =>
      prev.map((t) =>
        t.id === taskId
          ? { ...t, completed: !currentCompleted, updated_at: new Date().toISOString() }
          : t
      )
    );
    try {
      await toggleComplete(taskId, !currentCompleted);
      const [statsData, upcomingData] = await Promise.all([fetchStats(), fetchUpcoming()]);
      setStats(statsData);
      setUpcoming(upcomingData);
    } catch {
      setTasks((prev) =>
        prev.map((t) => t.id === taskId ? { ...t, completed: currentCompleted } : t)
      );
    }
  }

  async function handleUpdate(taskId, data) {
    const updated = await updateTask(taskId, data);
    setTasks((prev) => prev.map((t) => t.id === taskId ? updated : t));
    if (selectedTask?.id === taskId) setSelectedTask(updated);
    const [statsData, upcomingData] = await Promise.all([fetchStats(), fetchUpcoming()]);
    setStats(statsData);
    setUpcoming(upcomingData);
  }

  async function handleDelete(taskId) {
    await deleteTask(taskId);
    if (selectedTask?.id === taskId) setSelectedTask(null);
    await loadAll(apiFilters);
  }

  const courses = stats?.courses ?? [];

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-inner">
          <div>
            <h1 className="app-title">Student Task Manager</h1>
            <p className="app-subtitle">FastAPI + React · COMPSCI732</p>
          </div>
          <a href="http://localhost:8000/docs" target="_blank" rel="noreferrer" className="docs-link">
            API Docs <ExternalLink size={12} />
          </a>
        </div>
      </header>

      <main className="app-main">
        <StatsCards stats={stats} />
        <AddTaskForm onSubmit={handleCreate} />

        <FilterBar
          apiFilters={apiFilters}
          searchTerm={searchTerm}
          onApiFilterChange={handleApiFilterChange}
          onSearchChange={setSearchTerm}
          courses={courses}
          tasks={tasks}             // passed for local suggestion computation
        />

        {error && <div className="error-banner">{error}</div>}

        {loading ? (
          <div className="loading-state">
            <div className="spinner" />
            <p>Loading tasks…</p>
          </div>
        ) : (
          <TaskList
            tasks={visibleTasks}   // locally filtered
            upcoming={upcoming}
            sortBy={apiFilters.sort_by}
            onToggle={handleToggle}
            onDelete={handleDelete}
            onSelect={setSelectedTask}
          />
        )}
      </main>

      {selectedTask && (
        <TaskModal task={selectedTask} onClose={() => setSelectedTask(null)} onUpdate={handleUpdate} />
      )}
    </div>
  );
}
