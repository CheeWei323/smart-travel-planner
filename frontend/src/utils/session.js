export const SESSION_EXPIRED_MESSAGE = "Your session has expired. Please log in again.";
export const SESSION_EVENT_KEY = "travelwise:session-event";
let currentSession = null;
let csrfToken = null;
let revision = 0;
let localQueue = Promise.resolve();

// Remove credentials left by the previous bearer-token implementation.
localStorage.removeItem("token");
localStorage.removeItem("user");
sessionStorage.removeItem("token");
sessionStorage.removeItem("user");

export const getSessionId = () => currentSession?.sessionId || null;
export const getSessionRevision = () => revision;
export const getCsrfToken = () => csrfToken;
export const setCsrfToken = (value) => {
  if (typeof value !== "string" || !/^[a-f0-9]{64}$/.test(value))
    throw new Error("Could not establish request protection. Refresh the page.");
  csrfToken = value;
};
const announce = () => localStorage.setItem(SESSION_EVENT_KEY,
  crypto.getRandomValues(new Uint32Array(4)).join("-"));

export function acceptSession(data, broadcast = false) {
  if (typeof data.sessionId !== "string" || !/^[a-f0-9]{32}$/.test(data.sessionId) ||
      !Number.isSafeInteger(data.expiresAt) || data.expiresAt <= Date.now())
    throw new Error(SESSION_EXPIRED_MESSAGE);
  setCsrfToken(data.csrfToken);
  currentSession = { sessionId: data.sessionId, expiresAt: data.expiresAt };
  revision += 1;
  window.dispatchEvent(new CustomEvent("travelwise:session-updated", { detail: data.user }));
  if (broadcast) announce();
}

export function endStoredSession(message = "", expectedId = getSessionId(), broadcast = false) {
  if (getSessionId() !== expectedId) return false;
  currentSession = null;
  csrfToken = null;
  revision += 1;
  window.dispatchEvent(new CustomEvent("travelwise:session-ended", { detail: message }));
  if (broadcast) announce();
  return true;
}

// Serializes cookie-changing operations across modern browser tabs. The fallback
// serializes one page; CSRF/session checks still reject stale unsafe requests.
export function withSessionLock(work) {
  if (navigator.locks?.request) return navigator.locks.request("travelwise-session", work);
  const result = localQueue.then(work, work);
  localQueue = result.catch(() => {});
  return result;
}

export function startSessionExpiry() {
  let timer;
  let stopped = false;
  const check = () => {
    clearTimeout(timer);
    if (stopped || !currentSession) return;
    const remaining = currentSession.expiresAt - Date.now();
    if (remaining <= 0) endStoredSession(SESSION_EXPIRED_MESSAGE, getSessionId(), true);
    else timer = setTimeout(check, Math.min(remaining, 2147483647));
  };
  const events = ["focus", "travelwise:session-updated", "travelwise:session-ended"];
  for (const event of events) window.addEventListener(event, check);
  document.addEventListener("visibilitychange", check);
  queueMicrotask(check);
  return () => {
    stopped = true;
    clearTimeout(timer);
    for (const event of events) window.removeEventListener(event, check);
    document.removeEventListener("visibilitychange", check);
  };
}
