/**
 * AddTaskForm — collapsible form for creating a new task.
 */
import { useState } from "react";
import { Plus, X } from "lucide-react";

const INITIAL = {
  title: "",
  course: "",
  due_date: "",
  priority: "medium",
  description: "",
};

export default function AddTaskForm({ onSubmit }) {
  const [form, setForm] = useState(INITIAL);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [open, setOpen] = useState(false);

  function handleChange(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (!form.title.trim() || !form.course.trim() || !form.due_date) {
      setError("Title, course, and due date are required.");
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit({
        ...form,
        description: form.description.trim() || null,
      });
      setForm(INITIAL);
      setOpen(false);
    } catch {
      setError("Failed to create task. Please check your input.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="add-task-panel">
      <button className="btn-toggle-form" onClick={() => setOpen((o) => !o)}>
        {open
          ? <><X size={14} /> Cancel</>
          : <><Plus size={14} /> Add New Task</>
        }
      </button>

      {open && (
        <form className="add-task-form" onSubmit={handleSubmit}>
          <div className="form-row">
            <input
              name="course"
              value={form.course}
              onChange={handleChange}
              placeholder="Course code * (e.g. COMPSCI732)"
              maxLength={50}
              className="form-input"
            />
            <input
              name="title"
              value={form.title}
              onChange={handleChange}
              placeholder="Task title *"
              maxLength={200}
              className="form-input"
            />
          </div>

          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            placeholder="Description (optional)"
            maxLength={1000}
            rows={2}
            className="form-textarea"
          />

          <div className="form-row">
            <input
              name="due_date"
              type="date"
              value={form.due_date}
              onChange={handleChange}
              className="form-input"
            />
            <select name="priority" value={form.priority} onChange={handleChange} className="form-select">
              <option value="low">Low priority</option>
              <option value="medium">Medium priority</option>
              <option value="high">High priority</option>
            </select>
            <button type="submit" className="btn-add" disabled={submitting}>
              <Plus size={14} />
              {submitting ? "Adding…" : "Add Task"}
            </button>
          </div>

          {error && <p className="form-error">{error}</p>}
        </form>
      )}
    </div>
  );
}
