export const MIN_PASSWORD_LENGTH = 15;
export const PASSWORD_HINT =
  "Use at least 15 characters. Try a phrase with several words.";

// UI feedback mirrors the length/encoding checks; the API enforces the blocklist.
export function newPasswordError(value) {
  if (typeof value !== "string" || !value.isWellFormed())
    return "Enter a valid password";
  if (new TextEncoder().encode(value).length > 72)
    return "Password is too long. Use a shorter passphrase.";
  if (Array.from(value).length < MIN_PASSWORD_LENGTH)
    return "Password must be at least 15 characters";
  return "";
}
