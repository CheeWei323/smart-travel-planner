const User = require("../models/User");
const { tokenVersionFilter } = require("./sessionSecurity");

const MAX_FAILED_LOGINS = 5;
const LOCK_DURATION_MS = 15 * 60 * 1000;
const LOGIN_FAILURE_MESSAGE = "Invalid email or password";

const accountIdentity = (account) => ({
  _id: account._id,
  email: account.email,
  password: account.password,
  $and: [tokenVersionFilter(account.tokenVersion)],
  // Preserve the schema's active-by-default behavior for older stored records.
  $or: [{ isActive: true }, { isActive: { $exists: false } }],
});

// Check current database state, not the document read before bcrypt finished.
const eligibleAccount = (account) => ({
  ...accountIdentity(account),
  $expr: {
    $lte: [{ $ifNull: ["$lockUntil", new Date(0)] }, "$$NOW"],
  },
});

const recordFailedLogin = (account) =>
  User.updateOne(
    eligibleAccount(account),
    [
      {
        $set: {
          failedLogins: {
            $add: [
              {
                // A non-null deadline that matched eligibility has expired.
                $cond: [
                  { $ne: [{ $ifNull: ["$lockUntil", null] }, null] },
                  0,
                  { $ifNull: ["$failedLogins", 0] },
                ],
              },
              1,
            ],
          },
        },
      },
      {
        $set: {
          lockUntil: {
            $cond: [
              { $gte: ["$failedLogins", MAX_FAILED_LOGINS] },
              { $add: ["$$NOW", LOCK_DURATION_MS] },
              null,
            ],
          },
        },
      },
    ],
    { updatePipeline: true },
  );

// A simultaneous fifth failure, password change or suspension must prevent login.
const completeLogin = (account) =>
  User.findOneAndUpdate(
    eligibleAccount(account),
    { $set: { failedLogins: 0, lockUntil: null } },
    { returnDocument: "after" },
  ).select("username email role +tokenVersion");

// Called only after password verification. Use MongoDB time, like the lock writer.
const getLoginLock = async (account) => {
  const [lock] = await User.aggregate([
    {
      $match: {
        ...accountIdentity(account),
        $expr: { $gt: [{ $ifNull: ["$lockUntil", new Date(0)] }, "$$NOW"] },
      },
    },
    {
      $project: {
        _id: 0,
        retryAfterSeconds: {
          $ceil: { $divide: [{ $subtract: ["$lockUntil", "$$NOW"] }, 1000] },
        },
      },
    },
  ]);
  return lock || null;
};

module.exports = { recordFailedLogin, completeLogin, getLoginLock, LOGIN_FAILURE_MESSAGE };
