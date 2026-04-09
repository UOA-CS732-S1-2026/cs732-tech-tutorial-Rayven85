/**
 * FilterBar — search (local, instant) + API filters (course, priority, status, sort).
 *
 * Search works entirely in the browser against the already-loaded task list.
 * Typing shows a dropdown of matching suggestions (course / title / description).
 * Selecting a suggestion fills the search box; pressing Escape or blurring closes it.
 *
 */
import { useRef, useState } from "react";
import { Search, X } from "lucide-react";

// Extract leading alpha prefix from course code: "COMPSCI732" → "COMPSCI"
function coursePrefix(code) {
  const m = code.match(/^[A-Za-z]+/);
  return m ? m[0].toUpperCase() : "";
}

// Compute up to `limit` suggestions from tasks matching the search term.
// Searches course code, title, and description.
function computeSuggestions(tasks, term, limit = 6) {
  if (!term.trim()) return [];
  const kw = term.toLowerCase();
  return tasks
    .filter((t) =>
      t.course.toLowerCase().includes(kw) ||
      t.title.toLowerCase().includes(kw) ||
      (t.description && t.description.toLowerCase().includes(kw))
    )
    .slice(0, limit);
}

// Highlight the matched substring in a string
function Highlight({ text, term }) {
  if (!term) return <>{text}</>;
  const idx = text.toLowerCase().indexOf(term.toLowerCase());
  if (idx === -1) return <>{text}</>;
  return (
    <>
      {text.slice(0, idx)}
      <mark className="suggestion-mark">{text.slice(idx, idx + term.length)}</mark>
      {text.slice(idx + term.length)}
    </>
  );
}

// Detect where the term matched so we can show a hint
function matchHint(task, term) {
  const kw = term.toLowerCase();
  if (task.course.toLowerCase().includes(kw)) return "course";
  if (task.title.toLowerCase().includes(kw))  return "title";
  return "description";
}

export default function FilterBar({
  apiFilters, searchTerm,
  onApiFilterChange, onSearchChange,
  courses, tasks,
}) {
  const [showDrop, setShowDrop] = useState(false);
  const inputRef = useRef(null);
  // Index of keyboard-highlighted suggestion
  const [activeIdx, setActiveIdx] = useState(-1);

  const suggestions = computeSuggestions(tasks, searchTerm);

  function handleSearchInput(e) {
    onSearchChange(e.target.value);
    setShowDrop(true);
    setActiveIdx(-1);
  }

  function selectSuggestion(task) {
    // Fill with "COURSE Title" so both are visible in the box
    onSearchChange(`${task.course} ${task.title}`);
    setShowDrop(false);
    inputRef.current?.blur();
  }

  function clearSearch() {
    onSearchChange("");
    setShowDrop(false);
    inputRef.current?.focus();
  }

  // Keyboard navigation inside the dropdown
  function handleKeyDown(e) {
    if (!showDrop || suggestions.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIdx((i) => Math.min(i + 1, suggestions.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIdx((i) => Math.max(i - 1, -1));
    } else if (e.key === "Enter" && activeIdx >= 0) {
      e.preventDefault();
      selectSuggestion(suggestions[activeIdx]);
    } else if (e.key === "Escape") {
      setShowDrop(false);
    }
  }

  function handleApiChange(e) {
    onApiFilterChange({ ...apiFilters, [e.target.name]: e.target.value });
  }

  function clearAll() {
    onSearchChange("");
    onApiFilterChange({ course: "", priority: "", completed: "", sort_by: "" });
    setShowDrop(false);
  }

  const prefixes = [...new Set(courses.map(coursePrefix))].filter(Boolean).sort();
  const hasActive = searchTerm || apiFilters.course || apiFilters.priority ||
                    apiFilters.completed !== "" || apiFilters.sort_by;

  return (
    <div className="filter-bar">
      {/* ── Search with dropdown ───────────────────────── */}
      <div className="filter-search">
        <span className="search-icon-wrap"><Search size={13} /></span>

        <input
          ref={inputRef}
          value={searchTerm}
          onChange={handleSearchInput}
          onFocus={() => searchTerm && setShowDrop(true)}
          onBlur={() => setTimeout(() => setShowDrop(false), 150)} // allow click on suggestion
          onKeyDown={handleKeyDown}
          placeholder="Search by course, title, or description…"
          className="search-input"
          autoComplete="off"
        />

        {/* Clear button */}
        {searchTerm && (
          <button className="search-clear" onClick={clearSearch} tabIndex={-1}>
            <X size={12} />
          </button>
        )}

        {/* Suggestions dropdown */}
        {showDrop && suggestions.length > 0 && (
          <ul className="suggestion-list" role="listbox">
            {suggestions.map((task, i) => {
              const hint = matchHint(task, searchTerm);
              return (
                <li
                  key={task.id}
                  className={`suggestion-item ${i === activeIdx ? "suggestion-active" : ""}`}
                  onMouseDown={() => selectSuggestion(task)}
                  role="option"
                  aria-selected={i === activeIdx}
                >
                  <span className="suggestion-title">
                    <span className="suggestion-course">
                      <Highlight text={task.course} term={hint === "course" ? searchTerm : ""} />
                    </span>
                    {" "}
                    <Highlight text={task.title} term={hint === "title" ? searchTerm : ""} />
                  </span>
                  {hint === "description" && task.description && (
                    <span className="suggestion-hint">
                      description matches
                    </span>
                  )}
                </li>
              );
            })}
          </ul>
        )}

        {/* No results hint */}
        {showDrop && searchTerm.trim() && suggestions.length === 0 && (
          <div className="suggestion-empty">No matches found</div>
        )}
      </div>

      {/* ── API filters ─────────────────────────────────── */}
      <div className="filter-controls">
        <select name="course" value={apiFilters.course} onChange={handleApiChange} className="filter-select">
          <option value="">All courses</option>
          {prefixes.map((p) => <option key={p} value={p}>{p}</option>)}
        </select>

        <select name="priority" value={apiFilters.priority} onChange={handleApiChange} className="filter-select">
          <option value="">All priorities</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>

        <select name="completed" value={apiFilters.completed} onChange={handleApiChange} className="filter-select">
          <option value="">All status</option>
          <option value="false">Pending</option>
          <option value="true">Completed</option>
        </select>

        <select name="sort_by" value={apiFilters.sort_by} onChange={handleApiChange} className="filter-select">
          <option value="">Sort by…</option>
          <option value="due_date">Due date</option>
          <option value="priority">Priority</option>
          <option value="created_at">Created</option>
        </select>

        {hasActive && (
          <button className="btn-clear" onClick={clearAll}>
            <X size={12} /> Clear
          </button>
        )}
      </div>
    </div>
  );
}
