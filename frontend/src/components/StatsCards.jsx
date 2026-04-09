/**
 * StatsCards — summary statistics from GET /tasks/stats.
 */
import { CheckCircle2, Circle, ListTodo, TrendingUp, Flag } from "lucide-react";

export default function StatsCards({ stats }) {
  if (!stats) return null;

  const pct = stats.completion_rate;

  return (
    <div className="stats-section">
      <div className="stats-cards">
        <div className="stat-card stat-total">
          <ListTodo size={15} className="stat-icon" />
          <span className="stat-number">{stats.total}</span>
          <span className="stat-label">Total</span>
        </div>
        <div className="stat-card stat-pending">
          <Circle size={15} className="stat-icon" />
          <span className="stat-number">{stats.pending}</span>
          <span className="stat-label">Pending</span>
        </div>
        <div className="stat-card stat-completed">
          <CheckCircle2 size={15} className="stat-icon" />
          <span className="stat-number">{stats.completed}</span>
          <span className="stat-label">Completed</span>
        </div>
        <div className="stat-card stat-rate">
          <TrendingUp size={15} className="stat-icon" />
          <span className="stat-number">{pct}%</span>
          <span className="stat-label">Done</span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="progress-wrap">
        <div className="progress-track">
          <div className="progress-fill" style={{ width: `${pct}%` }} />
        </div>
        <span className="progress-label">{pct}% complete</span>
      </div>

      {/* Priority breakdown */}
      <div className="priority-row">
        <span className="priority-row-label">
          <Flag size={11} style={{ display: "inline", verticalAlign: "middle", marginRight: 3 }} />
          Priority
        </span>
        <span className="pb-chip pb-high">High · {stats.by_priority.high}</span>
        <span className="pb-chip pb-medium">Medium · {stats.by_priority.medium}</span>
        <span className="pb-chip pb-low">Low · {stats.by_priority.low}</span>
      </div>
    </div>
  );
}
