import { useCallback, useState } from "react";
import { Navigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import useResource from "../hooks/useResource";
import * as service from "../services/adminService";
import { errorMessage } from "../services/api";
import {
  ConfirmAction,
  Empty,
  Loading,
  Notice,
  PageTitle,
} from "../components/UI";
import { formatDate } from "../utils/dates";
const pageDetails = {
  Overview: [
    "Admin dashboard",
    "An overview of accounts, trips and community feedback.",
  ],
  Users: ["User management", "Manage accounts, roles and account status."],
  Trips: [
    "Trip management",
    "Review travelers’ trip records and remove records when needed.",
  ],
  Announcements: [
    "Announcements",
    "Create and manage messages shown to travelers.",
  ],
  Feedback: [
    "Feedback management",
    "Review feedback, respond to travelers and manage conversation status.",
  ],
  Security: [
    "Security logs",
    "Recent sign-ins, failed logins and admin actions on accounts.",
  ],
};
export default function AdminPage({ section = "Overview" }) {
  const [params] = useSearchParams();
  const legacy = Object.keys(pageDetails).find(
    (value) => value.toLowerCase() === params.get("tab"),
  );
  if (section === "Overview" && legacy && legacy !== "Overview")
    return <Navigate to={"/admin/" + legacy.toLowerCase()} replace />;
  const [title, description] = pageDetails[section];
  return (
    <>
      <PageTitle eyebrow="ADMIN PORTAL" title={title}>
        {description}
      </PageTitle>
      {section === "Overview" && <Overview />}
      {section === "Users" && <Users />}
      {section === "Trips" && <Trips />}
      {section === "Announcements" && <Announcements />}
      {section === "Feedback" && <Feedback />}
      {section === "Security" && <SecurityLogs />}
    </>
  );
}
function Retry({ error, reload }) {
  return error ? (
    <>
      <Notice>{error}</Notice>
      <button className="button secondary" onClick={reload}>
        Try again
      </button>
    </>
  ) : null;
}
function Overview() {
  const { data, loading, error, reload } = useResource(service.getStats, null);
  if (loading) return <Loading>Loading overview…</Loading>;
  if (error) return <Retry error={error} reload={reload} />;
  return (
    <>
      <div className="stats-grid">
        {[
          ["Total accounts", data.totalUsers],
          ["New accounts · 7 days", data.newUsers],
          ["Suspended accounts", data.suspendedUsers],
          ["Total trips", data.totalTrips],
          ["Upcoming trips", data.upcomingTrips],
          ["Saved destinations", data.totalFavorites],
          ["Open feedback", data.openFeedback],
        ].map(([label, value]) => (
          <div className="stat-card" key={label}>
            <p>{label}</p>
            <strong>{value}</strong>
          </div>
        ))}
      </div>
      <section className="panel">
        <h2>Popular destinations</h2>
        {data.topDestinations.length ? (
          <ol className="destination-ranking">
            {data.topDestinations.map((item) => (
              <li key={item.destination}>
                <span>{item.destination}</span>
                <strong>{item.count} trips</strong>
              </li>
            ))}
          </ol>
        ) : (
          <p className="muted">
            Destinations will appear as people create trips.
          </p>
        )}
      </section>
    </>
  );
}
function Search({ value, setValue, onSearch, label }) {
  return (
    <form
      className="inline-form admin-search"
      onSubmit={(event) => {
        event.preventDefault();
        onSearch();
      }}
    >
      <label className="grow">
        {label}
        <input
          value={value}
          onChange={(event) => setValue(event.target.value)}
          maxLength={100}
          placeholder={label}
        />
      </label>
      <button className="button secondary">Search</button>
    </form>
  );
}
function Users() {
  const { user: me } = useAuth();
  const [query, setQuery] = useState("");
  const [draft, setDraft] = useState("");
  const load = useCallback(() => service.getUsers(query), [query]);
  const { data, loading, error, reload } = useResource(load);
  const change = async (item, update) => {
    await service.updateUser(item._id, update);
    reload();
  };
  return (
    <section className="panel">
      <Search
        value={draft}
        setValue={setDraft}
        label="Search accounts by name or email"
        onSearch={() => {
          setQuery(draft.trim());
          if (query === draft.trim()) reload();
        }}
      />
      <Retry error={error} reload={reload} />
      {loading ? (
        <Loading>Loading accounts…</Loading>
      ) : !data.length ? (
        <Empty title="No matching accounts">
          Try another name or email address.
        </Empty>
      ) : (
        <div className="table-wrap">
          <table>
            <caption className="sr-only">User account management</caption>
            <thead>
              <tr>
                {[
                  "Account",
                  "Role",
                  "Trips",
                  "Joined",
                  "Status",
                  "Actions",
                ].map((label) => (
                  <th key={label}>{label}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.map((item) => (
                <tr key={item._id}>
                  <td>
                    <strong>
                      {item.username}
                      {item._id === me.id ? " (you)" : ""}
                    </strong>
                    <small>{item.email}</small>
                  </td>
                  <td>{item.role}</td>
                  <td>{item.tripCount}</td>
                  <td>{formatDate(item.createdAt)}</td>
                  <td>
                    <span
                      className={`badge ${item.isActive ? "active" : "warning"}`}
                    >
                      {item.isActive ? "Active" : "Suspended"}
                    </span>
                  </td>
                  <td>
                    {item._id === me.id ? (
                      <span className="muted">Your account</span>
                    ) : (
                      <div className="actions wrap">
                        <ConfirmAction
                          label={
                            item.role === "admin" ? "Make user" : "Make admin"
                          }
                          title="Change account role?"
                          className="button secondary small"
                          onConfirm={() =>
                            change(item, {
                              role: item.role === "admin" ? "user" : "admin",
                            })
                          }
                        >
                          Change the permissions for {item.email}.
                        </ConfirmAction>
                        <ConfirmAction
                          label={item.isActive ? "Suspend" : "Reactivate"}
                          title={
                            item.isActive
                              ? "Suspend this account?"
                              : "Reactivate this account?"
                          }
                          className="button secondary small"
                          onConfirm={() =>
                            change(item, { isActive: !item.isActive })
                          }
                        >
                          {item.isActive
                            ? "This user will be unable to access their account until reactivated."
                            : "This user will be able to log in again."}
                        </ConfirmAction>
                        <ConfirmAction
                          label="Delete user"
                          title="Permanently delete this user?"
                          className="button ghost-danger small"
                          onConfirm={async () => {
                            await service.deleteUser(item._id);
                            reload();
                          }}
                        >
                          All travel data belonging to {item.email} will also be
                          deleted.
                        </ConfirmAction>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
function Trips() {
  const [query, setQuery] = useState("");
  const [draft, setDraft] = useState("");
  const load = useCallback(() => service.getAllTrips(query), [query]);
  const { data, loading, error, reload } = useResource(load);
  return (
    <section className="panel">
      <Search
        value={draft}
        setValue={setDraft}
        label="Search trips by destination"
        onSearch={() => {
          setQuery(draft.trim());
          if (query === draft.trim()) reload();
        }}
      />
      <Retry error={error} reload={reload} />
      {loading ? (
        <Loading>Loading trips…</Loading>
      ) : !data.length ? (
        <Empty title="No matching trips">Try another destination.</Empty>
      ) : (
        <div className="table-wrap">
          <table>
            <caption className="sr-only">All users’ trips</caption>
            <thead>
              <tr>
                {["Destination", "Traveler", "Dates", "Actions"].map(
                  (label) => (
                    <th key={label}>{label}</th>
                  ),
                )}
              </tr>
            </thead>
            <tbody>
              {data.map((item) => (
                <tr key={item._id}>
                  <td>
                    <strong>{item.destination}</strong>
                  </td>
                  <td>
                    {item.userId?.username || "Deleted account"}
                    <small>{item.userId?.email}</small>
                  </td>
                  <td>
                    {formatDate(item.startDate)}
                    <small>to {formatDate(item.endDate)}</small>
                  </td>
                  <td>
                    <ConfirmAction
                      label="Delete trip"
                      title={`Delete ${item.destination}?`}
                      className="button ghost-danger small"
                      onConfirm={async () => {
                        await service.deleteAnyTrip(item._id);
                        reload();
                      }}
                    >
                      This permanently removes the trip, itinerary and
                      checklist.
                    </ConfirmAction>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
function Announcements() {
  const { data, loading, error, reload } = useResource(
    service.getAnnouncements,
  );
  const [editing, setEditing] = useState(null);
  const [message, setMessage] = useState("");
  const [actionError, setActionError] = useState("");
  const toggle = async (item) => {
    setActionError("");
    try {
      await service.updateAnnouncement(item._id, { isActive: !item.isActive });
      reload();
    } catch (failure) {
      setActionError(errorMessage(failure));
    }
  };
  return (
    <div className="feedback-grid">
      <AnnouncementForm
        key={editing?._id || "new"}
        item={editing}
        cancel={() => setEditing(null)}
        saved={() => {
          setMessage(
            editing ? "Announcement updated." : "Announcement created.",
          );
          setEditing(null);
          reload();
        }}
      />
      <section>
        <div className="section-heading">
          <h2>Announcements</h2>
          <button className="button secondary small" onClick={reload}>
            Refresh
          </button>
        </div>
        <Notice type="success">{message}</Notice>
        <Notice>{actionError}</Notice>
        <Retry error={error} reload={reload} />
        {loading ? (
          <Loading>Loading announcements…</Loading>
        ) : !data.length ? (
          <Empty title="A clear line to your travelers">
            Create an announcement to show a message on their dashboards.
          </Empty>
        ) : (
          <div className="form-stack">
            {data.map((item) => (
              <article className="panel" key={item._id}>
                <div className="section-heading">
                  <span
                    className={`badge ${item.isActive ? "active" : "completed"}`}
                  >
                    {item.isActive ? "Visible" : "Hidden"}
                  </span>
                  <span className="muted">{item.type}</span>
                </div>
                <h3>{item.title}</h3>
                <p className="preserve-lines">{item.message}</p>
                <div className="actions wrap">
                  <button
                    className="button secondary small"
                    onClick={() => setEditing(item)}
                  >
                    Edit
                  </button>
                  <button
                    className="button secondary small"
                    onClick={() => toggle(item)}
                  >
                    {item.isActive ? "Hide" : "Publish"}
                  </button>
                  <ConfirmAction
                    label="Delete announcement"
                    title="Delete this announcement?"
                    className="button ghost-danger small"
                    onConfirm={async () => {
                      await service.deleteAnnouncement(item._id);
                      if (editing?._id === item._id) setEditing(null);
                      reload();
                    }}
                  >
                    This message will be permanently removed.
                  </ConfirmAction>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
function AnnouncementForm({ item, cancel, saved }) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const submit = async (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    setPending(true);
    setError("");
    const payload = {
      title: data.get("title"),
      message: data.get("message"),
      type: data.get("type"),
      isActive: data.get("isActive") === "on",
    };
    try {
      if (item) await service.updateAnnouncement(item._id, payload);
      else await service.createAnnouncement(payload);
      form.reset();
      saved();
    } catch (failure) {
      setError(errorMessage(failure));
    } finally {
      setPending(false);
    }
  };
  return (
    <form className="panel form-stack" onSubmit={submit}>
      <h2>{item ? "Edit announcement" : "New announcement"}</h2>
      <Notice>{error}</Notice>
      <label>
        Title
        <input
          name="title"
          defaultValue={item?.title || ""}
          maxLength={120}
          required
        />
      </label>
      <label>
        Message
        <textarea
          name="message"
          defaultValue={item?.message || ""}
          rows={5}
          maxLength={2000}
          required
        />
      </label>
      <label>
        Style
        <select name="type" defaultValue={item?.type || "info"}>
          <option value="info">Information</option>
          <option value="success">Good news</option>
          <option value="warning">Important notice</option>
        </select>
      </label>
      <label className="checkbox-label">
        <input
          name="isActive"
          type="checkbox"
          defaultChecked={item?.isActive ?? true}
        />
        Show on travelers’ dashboards
      </label>
      <div className="actions">
        <button className="button" disabled={pending}>
          {pending
            ? "Saving…"
            : item
              ? "Save announcement"
              : "Create announcement"}
        </button>
        {item && (
          <button
            type="button"
            className="button secondary"
            disabled={pending}
            onClick={cancel}
          >
            Cancel editing
          </button>
        )}
      </div>
    </form>
  );
}
function Feedback() {
  const [status, setStatus] = useState("");
  const load = useCallback(() => service.getAllFeedback(status), [status]);
  const { data, loading, error, reload } = useResource(load);
  return (
    <>
      <div className="list-toolbar">
        <h2>Community feedback</h2>
        <label>
          Status
          <select
            value={status}
            onChange={(event) => setStatus(event.target.value)}
          >
            <option value="">All statuses</option>
            <option value="open">Open</option>
            <option value="reviewed">Reviewed</option>
            <option value="resolved">Resolved</option>
          </select>
        </label>
      </div>
      <Retry error={error} reload={reload} />
      {loading ? (
        <Loading>Loading feedback…</Loading>
      ) : !data.length ? (
        <Empty title="You’re all caught up">
          There are no messages matching this status.
        </Empty>
      ) : (
        <div className="form-stack">
          {data.map((item) => (
            <FeedbackItem
              key={`${item._id}-${item.updatedAt}`}
              item={item}
              reload={reload}
            />
          ))}
        </div>
      )}
    </>
  );
}
function FeedbackItem({ item, reload }) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const submit = async (event) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    setPending(true);
    setError("");
    try {
      await service.updateFeedback(item._id, Object.fromEntries(data));
      reload();
    } catch (failure) {
      setError(errorMessage(failure));
    } finally {
      setPending(false);
    }
  };
  return (
    <article className="panel">
      <div className="section-heading">
        <span className="eyebrow">
          {item.category} · {formatDate(item.createdAt)}
        </span>
        <span className={`badge ${item.status}`}>{item.status}</span>
      </div>
      <h3>{item.subject}</h3>
      <p className="muted">
        From {item.userId?.username || "Deleted account"} · {item.userId?.email}
      </p>
      <p className="preserve-lines">{item.message}</p>
      <form className="form-stack" onSubmit={submit}>
        <Notice>{error}</Notice>
        <label>
          Admin response
          <textarea
            name="adminReply"
            defaultValue={item.adminReply}
            rows={3}
            maxLength={2000}
          />
        </label>
        <label>
          Feedback status
          <select name="status" defaultValue={item.status}>
            <option value="open">Open</option>
            <option value="reviewed">Reviewed</option>
            <option value="resolved">Resolved</option>
          </select>
        </label>
        <div className="actions wrap">
          <button className="button" disabled={pending}>
            {pending ? "Saving…" : "Save response"}
          </button>
          <ConfirmAction
            label="Delete feedback"
            title="Delete this feedback?"
            className="button ghost-danger"
            onConfirm={async () => {
              await service.deleteFeedback(item._id);
              reload();
            }}
          >
            The traveler will no longer see this conversation.
          </ConfirmAction>
        </div>
      </form>
    </article>
  );
}
// Security Logs page: three count cards and a table of recent events
function SecurityLogs() {
  const { data, loading, error, reload } = useResource(
    service.getAuditLogs,
    null,
  );
  if (loading) return <Loading>Loading security logs…</Loading>;
  if (error) return <Retry error={error} reload={reload} />;
  return (
    <>
      <div className="stats-grid">
        {[
          ["Logins today", data.counts.loginsToday],
          ["Failed logins today", data.counts.failedToday],
          ["New users · 7 days", data.counts.newUsersWeek],
        ].map(([label, value]) => (
          <div className="stat-card" key={label}>
            <p>{label}</p>
            <strong>{value}</strong>
          </div>
        ))}
      </div>
      <section className="panel">
        <h2>Recent events</h2>
        {!data.logs.length ? (
          <p className="muted">No security events recorded yet.</p>
        ) : (
          <div className="table-wrap">
            <table>
              <caption className="sr-only">Recent security events</caption>
              <thead>
                <tr>
                  {[
                    "Time",
                    "Action",
                    "Account",
                    "IP address",
                    "Result",
                    "Details",
                  ].map((label) => (
                    <th key={label}>{label}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.logs.map((log) => (
                  <tr key={log._id}>
                    <td>{new Date(log.time).toLocaleString()}</td>
                    <td>{log.action}</td>
                    <td>{log.email || "—"}</td>
                    <td>{log.ip}</td>
                    <td>
                      <span
                        className={`badge ${log.success ? "active" : "warning"}`}
                      >
                        {log.success ? "Success" : "Failed"}
                      </span>
                    </td>
                    <td>{log.details}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </>
  );
}
