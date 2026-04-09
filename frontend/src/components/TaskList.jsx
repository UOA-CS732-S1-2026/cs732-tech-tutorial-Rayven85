/**
 * TaskList — animated list split into Pending / Completed sections.
 *
 * How the animation works
 * - `LayoutGroup` tells Framer Motion to coordinate all layout changes
 *   within this tree together.
 *
 * - Each card wrapper has `layoutId={task.id}`. When a card moves from
 *   Pending to Completed (different DOM parents), Framer Motion:
 *   1. Records the card's screen position before the re-render (FLIP)
 *   2. Renders the new tree (card is now in Completed section)
 *   3. Animates the card from its old screen position to the new one
 *   This gives the "physically sliding across the page" effect.
 *
 *
 * - `AnimatePresence` handles fade-in when a card first appears,
 *   and fade-out when it's deleted.
 */
import { LayoutGroup, AnimatePresence, motion } from "framer-motion";
import { ClipboardList, CheckCircle2 } from "lucide-react";
import TaskCard from "./TaskCard";

const PRIORITY_ORDER = { high: 2, medium: 1, low: 0 };

function sortGroup(tasks, sortBy) {
  const arr = [...tasks];
  if (sortBy === "due_date")   return arr.sort((a, b) => a.due_date.localeCompare(b.due_date));
  if (sortBy === "created_at") return arr.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
  // Default: priority
  return arr.sort((a, b) => PRIORITY_ORDER[b.priority] - PRIORITY_ORDER[a.priority]);
}

const cardVariants = {
  hidden: { opacity: 0, scale: 0.97 },
  show:   { opacity: 1, scale: 1,   transition: { duration: 0.22, ease: "easeOut" } },
  exit:   { opacity: 0, scale: 0.97, transition: { duration: 0.18, ease: "easeIn"  } },
};

export default function TaskList({ tasks, upcoming, sortBy, onToggle, onDelete, onSelect }) {
  if (tasks.length === 0) {
    return (
      <div className="task-list-empty">
        <p>No tasks found. Adjust your filters or add a task above.</p>
      </div>
    );
  }

  const pending = sortGroup(tasks.filter((t) => !t.completed), sortBy);
  const done    = sortGroup(tasks.filter((t) =>  t.completed), sortBy);
  const upcomingIds = new Set(upcoming.map((t) => t.id));

  return (
    // LayoutGroup coordinates layout animations across the two sections
    <LayoutGroup>
      <div className="task-sections">

        {/* ── Pending ──────────────────────────────────────── */}
        <section className="task-section">
          <motion.div layout className="section-header">
            <ClipboardList size={12} />
            Pending
            <span className="section-count">{pending.length}</span>
          </motion.div>

          {pending.length === 0 ? (
            <motion.p layout className="section-empty">
              All tasks completed — great work!
            </motion.p>
          ) : (
            <div className="task-list">
              <AnimatePresence>
                {pending.map((task) => (
                  <motion.div
                    key={task.id}
                    layoutId={task.id}          // ← the magic: same id in both sections
                    variants={cardVariants}
                    initial="hidden"
                    animate="show"
                    exit="exit"
                    layout
                    transition={{ layout: { duration: 0.38, ease: [0.4, 0, 0.2, 1] } }}
                  >
                    <TaskCard
                      task={task}
                      isUpcoming={upcomingIds.has(task.id)}
                      onToggle={onToggle}
                      onDelete={onDelete}
                      onSelect={onSelect}
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </section>

        {/* ── Completed ────────────────────────────────────── */}
        {done.length > 0 && (
          <section className="task-section">
            <motion.div layout className="section-header section-header-done">
              <CheckCircle2 size={12} />
              Completed
              <span className="section-count">{done.length}</span>
            </motion.div>

            <div className="task-list">
              <AnimatePresence>
                {done.map((task) => (
                  <motion.div
                    key={task.id}
                    layoutId={task.id}          // ← same id matches Pending side
                    variants={cardVariants}
                    initial="hidden"
                    animate="show"
                    exit="exit"
                    layout
                    transition={{ layout: { duration: 0.38, ease: [0.4, 0, 0.2, 1] } }}
                  >
                    <TaskCard
                      task={task}
                      isUpcoming={false}
                      onToggle={onToggle}
                      onDelete={onDelete}
                      onSelect={onSelect}
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </section>
        )}

      </div>
    </LayoutGroup>
  );
}
