import { useEffect, useId, useState } from "react";
import api, { errorMessage } from "../services/api";

export default function LocationSearch({
  value,
  onChange,
  onSelect,
  label = "Search destination",
  placeholder = "Search for a city or place",
  disabled = false,
}) {
  const inputId = useId();
  const [results, setResults] = useState([]);
  const [open, setOpen] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    if (value.trim().length < 3 || !open) return;
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      setLoading(true);
      setError("");
      try {
        const { data } = await api.get("/integrations/locations", {
          params: { q: value },
          signal: controller.signal,
        });
        if (!controller.signal.aborted) setResults(data);
      } catch (failure) {
        if (!controller.signal.aborted) {
          setError(errorMessage(failure));
          setResults([]);
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }, 350);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [value, open]);
  return (
    <div className="location-search">
      <label htmlFor={inputId}>{label}</label>
      <div className="search-wrap">
        <input
          id={inputId}
          value={value}
          placeholder={placeholder}
          disabled={disabled}
          autoComplete="off"
          aria-expanded={open && results.length > 0}
          aria-controls={`${inputId}-results`}
          onChange={(event) => {
            onChange(event.target.value);
            setResults([]);
            setOpen(true);
            setError("");
            setLoading(false);
          }}
          onKeyDown={(event) => {
            if (event.key === "Escape") setOpen(false);
          }}
        />
        {loading && open && (
          <span className="search-status" role="status">
            Searching…
          </span>
        )}
        {open && results.length > 0 && (
          <ul id={`${inputId}-results`} className="search-results">
            {results.map((item, index) => (
              <li key={`${item.lat}-${item.lon}-${index}`}>
                <button
                  type="button"
                  onClick={() => {
                    onSelect(item);
                    setOpen(false);
                    setResults([]);
                  }}
                >
                  <strong>{item.name}</strong>
                  <small>{item.address}</small>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
      {open && error && (
        <small className="muted" role="status">
          {error} You can enter a destination manually.
        </small>
      )}
    </div>
  );
}
