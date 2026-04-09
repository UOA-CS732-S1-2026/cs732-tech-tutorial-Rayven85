/**
 * TaskCard — compact single-row task display.
 *
 * Animation is handled entirely by the motion.div wrapper in TaskList
 * (via layoutId). This component has no animation logic of its own.
 */
import { Calendar, Trash2, Clock } from "lucide-react";

function daysUntil(dueDateStr) {
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const due = new Date(dueDateStr + "T00:00:00");
  return Math.round((due - today) / (1000 * 60 * 60 * 24));
}

function dueDateInfo(dueDateStr) {
  const days = daysUntil(dueDateStr);
  const formatted = new Date(dueDateStr + "T00:00:00").toLocaleDateString("en-NZ", {
    day: "numeric", month: "short", year: "numeric",
  });
  if (days < 0)   return { text: `${formatted} — overdue`,       cls: "due-overdue" };
  if (days === 0) return { text: `${formatted} — today`,         cls: "due-today"   };
  if (days <= 3)  return { text: `${formatted} — ${days}d left`, cls: "due-soon"    };
  return { text: formatted, cls: "due-normal" };
}

export default function TaskCard({ task, isUpcoming, onToggle, onDelete, onSelect }) {
  const { text: dateText, cls: dateCls } = dueDateInfo(task.due_date);

  return (
    <div
      className={[
        "task-card",
        `priority-border-${task.priority}`,
        task.completed  ? "completed"          : "",
        isUpcoming      ? "upcoming-highlight" : "",
      ].filter(Boolean).join(" ")}
      onClick={() => onSelect(task)}
    >
      {/* Checkbox — stopPropagation prevents opening the modal */}
      <input
        type="checkbox"
        className="task-checkbox"
        checked={task.completed}
        onChange={() => onToggle(task.id, task.completed)}
        onClick={(e) => e.stopPropagation()}
        aria-label={`Mark "${task.title}" as ${task.completed ? "incomplete" : "complete"}`}
      />

      {/* Course code + title */}
      <span className="task-title">
        <span className="task-course-prefix">{task.course}</span>
        {" "}{task.title}
      </span>

      {/* Meta */}
      <div className="task-meta">
        {isUpcoming && !task.completed && (
          <span className="meta-item meta-upcoming" title="Due within 7 days">
            <Clock size={11} />
          </span>
        )}
        <span className={`meta-item ${dateCls}`}>
          <Calendar size={11} />
          {dateText}
        </span>
        <span className={`badge badge-${task.priority}`}>{task.priority}</span>
      </div>

      {/* Delete button */}
      <button
        className="btn-delete"
        onClick={(e) => { e.stopPropagation(); onDelete(task.id); }}
        aria-label={`Delete "${task.title}"`}
        title="Delete task"
      >
        <Trash2 size={14} />
      </button>
    </div>
  );
}
