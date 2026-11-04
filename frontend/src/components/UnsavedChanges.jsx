import { useEffect, useRef } from "react";
import { useBlocker } from "react-router-dom";
export default function UnsavedChanges({ when }) {
  const blocker = useBlocker(when);
  const dialog = useRef(null);
  useEffect(() => {
    const warn = (event) => {
      if (when) {
        event.preventDefault();
        event.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [when]);
  useEffect(() => {
    if (blocker.state === "blocked") dialog.current.showModal();
    else dialog.current.close();
  }, [blocker.state]);
  return (
    <dialog
      className="confirm-dialog"
      ref={dialog}
      onCancel={() => blocker.reset?.()}
    >
      <h2>Leave without saving?</h2>
      <p className="muted">
        You have unsaved changes. Save them first, or discard them to leave this
        page.
      </p>
      <div className="actions end">
        <button
          className="button secondary"
          onClick={() => blocker.reset()}
          autoFocus
        >
          Keep editing
        </button>
        <button className="button danger" onClick={() => blocker.proceed()}>
          Discard changes
        </button>
      </div>
    </dialog>
  );
}
