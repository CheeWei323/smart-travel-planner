import { useCallback, useState } from "react";
import useResource from "../hooks/useResource";
import {
  getChecklist,
  addChecklistItem,
  updateChecklistItem,
  deleteChecklistItem,
} from "../services/checklistService";
import { errorMessage } from "../services/api";
import { Loading, Notice } from "./UI";

export default function Checklist({ tripId, readOnly = false }) {
  const load = useCallback(() => getChecklist(tripId), [tripId]);
  const { data: items, setData, loading, error, reload } = useResource(load);
  const [task, setTask] = useState("");
  const [pending, setPending] = useState(false);
  const [busy, setBusy] = useState(null);
  const [actionError, setActionError] = useState("");
  const add = async (event) => {
    event.preventDefault();
    setPending(true);
    setActionError("");
    try {
      const item = await addChecklistItem(tripId, task);
      setData((previous) => [...previous, item]);
      setTask("");
    } catch (failure) {
      setActionError(errorMessage(failure));
    } finally {
      setPending(false);
    }
  };
  const change = async (item, remove = false) => {
    setBusy(item._id);
    setActionError("");
    try {
      if (remove) {
        await deleteChecklistItem(item._id);
        setData((previous) =>
          previous.filter((value) => value._id !== item._id),
        );
      } else {
        const updated = await updateChecklistItem(item._id, {
          isCompleted: !item.isCompleted,
        });
        setData((previous) =>
          previous.map((value) => (value._id === item._id ? updated : value)),
        );
      }
    } catch (failure) {
      setActionError(errorMessage(failure));
    } finally {
      setBusy(null);
    }
  };
  if (loading) return <Loading>Loading checklist…</Loading>;
  return (
    <>
      <div className="section-heading">
        <h2>Travel checklist</h2>
        <span className="badge">
          {items.filter((item) => item.isCompleted).length}/{items.length}{" "}
          complete
        </span>
      </div>
      <Notice>{error || actionError}</Notice>
      {error && (
        <button type="button" className="button secondary" onClick={reload}>
          Try again
        </button>
      )}
      {!readOnly && (
        <form className="inline-form" onSubmit={add}>
          <label className="grow">
            New checklist task
            <input
              value={task}
              onChange={(event) => setTask(event.target.value)}
              required
              maxLength={300}
              placeholder="Pack chargers, check booking details…"
            />
          </label>
          <button
            className="button secondary"
            disabled={pending || !task.trim()}
          >
            {pending ? "Adding…" : "+ Add task"}
          </button>
        </form>
      )}
      <ul className="checklist">
        {items.map((item) => (
          <li key={item._id}>
            <label className={item.isCompleted ? "done" : ""}>
              <input
                type="checkbox"
                checked={item.isCompleted}
                disabled={readOnly || busy === item._id}
                onChange={() => change(item)}
              />
              <span>{item.task}</span>
            </label>
            {!readOnly && (
              <button
                className="icon-button danger-text"
                type="button"
                disabled={busy === item._id}
                aria-label={`Delete task: ${item.task}`}
                onClick={() => change(item, true)}
              >
                ×
              </button>
            )}
          </li>
        ))}
      </ul>
      {!items.length && (
        <p className="muted">No tasks yet. Keep the little details here.</p>
      )}
    </>
  );
}
