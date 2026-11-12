import { useEffect, useId, useRef, useState } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";

export default function PasswordInput({ label, hint, id, ...inputProps }) {
  const generatedId = useId();
  const inputId = id || generatedId;
  const inputRef = useRef(null);
  const [visible, setVisible] = useState(false);
  const describedBy = [
    inputProps["aria-describedby"],
    hint && `${inputId}-hint`,
  ].filter(Boolean).join(" ") || undefined;

  useEffect(() => {
    const form = inputRef.current?.form;
    const hide = () => setVisible(false);
    form?.addEventListener("reset", hide);
    return () => form?.removeEventListener("reset", hide);
  }, []);

  return (
    <div className="password-field">
      <label htmlFor={inputId}>{label}</label>
      <div className="password-input">
        <input
          {...inputProps}
          ref={inputRef}
          id={inputId}
          type={visible ? "text" : "password"}
          aria-describedby={describedBy}
        />
        <button
          type="button"
          className="password-toggle"
          disabled={inputProps.disabled}
          aria-label={`${visible ? "Hide" : "Show"} ${label.toLowerCase()}`}
          title={`${visible ? "Hide" : "Show"} ${label.toLowerCase()}`}
          aria-controls={inputId}
          onClick={() => setVisible((current) => !current)}
        >
          {visible ? <FaEyeSlash aria-hidden="true" /> : <FaEye aria-hidden="true" />}
        </button>
      </div>
      {hint && <small id={`${inputId}-hint`}>{hint}</small>}
    </div>
  );
}
