/**
 * TaskModal — detail overlay shown when a task card is clicked.
 * Supports a togglable edit mode for updating task fields.
 *
 * Rendered with a portal so it sits above everything else in the DOM.
 */
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { X, BookOpen, Calendar, Flag, CheckCircle2, Clock, AlignLeft, Pencil, Save } from "lucide-react";

function formatDate(isoStr) {
  return new Date(isoStr).toLocaleDateString("en-NZ", {
    weekday: "short", year: "numeric", month: "long", day: "numeric",
  });
}

function formatDateTime(isoStr) {
  return new Date(isoStr).toLocaleString("en-NZ", {
    year: "numeric", month: "short", day: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

function daysLabel(dueDateStr) {
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const due = new Date(dueDateStr + "T00:00:00");
  const days = Math.round((due - today) / 86400000);
  if (days < 0) return { text: `${Math.abs(days)} day${Math.abs(days) !== 1 ? "s" : ""} overdue`, cls: "modal-due-overdue" };
  if (days === 0) return { text: "Due today", cls: "modal-due-today" };
  if (days === 1) return { text: "Due tomorrow", cls: "modal-due-soon" };
  return { text: `${days} days remaining`, cls: "modal-due-ok" };
}

const PRIORITY_LABEL = { high: "High", medium: "Medium", low: "Low" };

export default function TaskModal({ task, onClose, onUpdate }) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    course: task.course,
    title: task.title,
    description: task.description ?? "",
    due_date: task.due_date,
    priority: task.priority,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    function onKey(e) { if (e.key === "Escape") editing ? setEditing(false) : onClose(); }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose, editing]);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  function handleChange(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSave(e) {
    e.preventDefault();
    if (!form.title.trim() || !form.course.trim() || !form.due_date) {
      setError("Title, course, and due date are required.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      await onUpdate(task.id, {
        ...form,
        description: form.description.trim() || null,
      });
      setEditing(false);
    } catch {
      setError("Failed to save changes.");
    } finally {
      setSaving(false);
    }
  }

  const { text: dueText, cls: dueCls } = daysLabel(task.due_date);

  return createPortal(
    <div className="modal-overlay" onClick={editing ? undefined : onClose} role="dialog" aria-modal="true">
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>

        {/* Header */}
        <div className="modal-header">
          <div className="modal-header-left">
            <span className={`modal-badge modal-badge-${task.priority}`}>
              {PRIORITY_LABEL[task.priority]}
            </span>
            {task.completed && (
              <span className="modal-badge modal-badge-done">Completed</span>
            )}
          </div>
          <div className="modal-header-actions">
            {!editing && (
              <button className="modal-edit-btn" onClick={() => setEditing(true)} aria-label="Edit task">
                <Pencil size={14} /> Edit
              </button>
            )}
            <button className="modal-close" onClick={onClose} aria-label="Close">
              <X size={16} />
            </button>
          </div>
        </div>

        {editing ? (
          /* ── Edit form ── */
          <form className="modal-edit-form" onSubmit={handleSave}>
            <div className="modal-edit-row">
              <input
                name="course"
                value={form.course}
                onChange={handleChange}
                placeholder="Course code *"
                maxLength={50}
                className="modal-edit-input"
              />
              <input
                name="title"
                value={form.title}
                onChange={handleChange}
                placeholder="Task title *"
                maxLength={200}
                className="modal-edit-input"
              />
            </div>

            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Description (optional)"
              maxLength={1000}
              rows={3}
              className="modal-edit-textarea"
            />

            <div className="modal-edit-row">
              <input
                name="due_date"
                type="date"
                value={form.due_date}
                onChange={handleChange}
                className="modal-edit-input"
              />
              <select name="priority" value={form.priority} onChange={handleChange} className="modal-edit-select">
                <option value="low">Low priority</option>
                <option value="medium">Medium priority</option>
                <option value="high">High priority</option>
              </select>
            </div>

            {error && <p className="modal-edit-error">{error}</p>}

            <div className="modal-edit-actions">
              <button type="button" className="modal-edit-cancel" onClick={() => { setEditing(false); setError(""); }}>
                Cancel
              </button>
              <button type="submit" className="modal-edit-save" disabled={saving}>
                <Save size={13} />
                {saving ? "Saving…" : "Save changes"}
              </button>
            </div>
          </form>
        ) : (
          /* ── View mode ── */
          <>
            <h2 className={`modal-title ${task.completed ? "modal-title-done" : ""}`}>
              {task.title}
            </h2>

            <div className="modal-section">
              <div className="modal-section-label">
                <AlignLeft size={13} />
                Description
              </div>
              {task.description ? (
                <p className="modal-description">{task.description}</p>
              ) : (
                <p className="modal-description modal-description-empty">No description provided.</p>
              )}
            </div>

            <div className="modal-meta-grid">
              <div className="modal-meta-item">
                <BookOpen size={13} className="modal-meta-icon" />
                <div>
                  <div className="modal-meta-label">Course</div>
                  <div className="modal-meta-value">{task.course}</div>
                </div>
              </div>

              <div className="modal-meta-item">
                <Calendar size={13} className="modal-meta-icon" />
                <div>
                  <div className="modal-meta-label">Due Date</div>
                  <div className="modal-meta-value">{formatDate(task.due_date + "T00:00:00")}</div>
                  <div className={`modal-meta-sub ${dueCls}`}>{dueText}</div>
                </div>
              </div>

              <div className="modal-meta-item">
                <Flag size={13} className="modal-meta-icon" />
                <div>
                  <div className="modal-meta-label">Priority</div>
                  <div className="modal-meta-value">{PRIORITY_LABEL[task.priority]}</div>
                </div>
              </div>

              <div className="modal-meta-item">
                <CheckCircle2 size={13} className="modal-meta-icon" />
                <div>
                  <div className="modal-meta-label">Status</div>
                  <div className="modal-meta-value">{task.completed ? "Completed" : "Pending"}</div>
                </div>
              </div>
            </div>

            <div className="modal-timestamps">
              <span className="modal-ts-item">
                <Clock size={11} />
                Created: {formatDateTime(task.created_at)}
              </span>
              <span className="modal-ts-item">
                <Clock size={11} />
                Updated: {formatDateTime(task.updated_at)}
              </span>
            </div>
          </>
        )}
      </div>
    </div>,
    document.body
  );
}
