import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import { errorMessage } from "../services/api";

export function Notice({ children, type = "error" }) {
  return children ? (
    <div
      className={`notice ${type}`}
      role={type === "error" ? "alert" : "status"}
    >
      {children}
    </div>
  ) : null;
}
export function Loading({ children = "Loading your travel plans…" }) {
  return (
    <div className="loading" role="status">
      <span className="spinner" />
      {children}
    </div>
  );
}
export function Empty({ title, children, to, action }) {
  return (
    <div className="empty">
      <span className="empty-icon" aria-hidden="true">
        ✦
      </span>
      <h3>{title}</h3>
      <p>{children}</p>
      {to && (
        <Link className="button" to={to}>
          {action}
        </Link>
      )}
    </div>
  );
}
export function PageTitle({ eyebrow = "TRAVELWISE", title, children, action }) {
  return (
    <div className="page-heading">
      <div>
        <p className="eyebrow">{eyebrow}</p>
        <h1>{title}</h1>
        {children && <p className="muted">{children}</p>}
      </div>
      {action}
    </div>
  );
}
export function ConfirmAction({
  label,
  title,
  children,
  onConfirm,
  className = "button danger",
  disabled = false,
}) {
  const dialog = useRef(null);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const submit = async () => {
    setPending(true);
    setError("");
    try {
      await onConfirm();
      dialog.current?.close();
    } catch (failure) {
      setError(errorMessage(failure));
    } finally {
      setPending(false);
    }
  };
  return (
    <>
      <button
        type="button"
        className={className}
        disabled={disabled}
        onClick={() => {
          setError("");
          dialog.current.showModal();
        }}
      >
        {label}
      </button>
      <dialog
        ref={dialog}
        className="confirm-dialog"
        onCancel={(event) => {
          if (pending) event.preventDefault();
        }}
      >
        <h2>{title}</h2>
        <p className="muted">{children}</p>
        <Notice>{error}</Notice>
        <div className="actions end">
          <button
            type="button"
            className="button secondary"
            disabled={pending}
            onClick={() => dialog.current.close()}
            autoFocus
          >
            Cancel
          </button>
          <button
            type="button"
            className="button danger"
            disabled={pending}
            onClick={submit}
          >
            {pending ? "Please wait…" : label}
          </button>
        </div>
      </dialog>
    </>
  );
}
