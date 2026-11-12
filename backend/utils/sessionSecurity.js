const SESSION_SECONDS = 2 * 60 * 60;
const SESSION_ENDED_MESSAGE = "Your session has ended. Please log in again.";
const validTokenVersion = (value) => Number.isSafeInteger(value) && value >= 0;

// Only an absent stored field represents a legacy zero; JWTs must have a claim.
const tokenVersionFilter = (version) =>
  version === 0
    ? { $or: [{ tokenVersion: 0 }, { tokenVersion: { $exists: false } }] }
    : { tokenVersion: version };

module.exports = {
  SESSION_SECONDS,
  SESSION_ENDED_MESSAGE,
  validTokenVersion,
  tokenVersionFilter,
};
