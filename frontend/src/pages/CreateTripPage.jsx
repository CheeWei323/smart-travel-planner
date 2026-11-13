import UnsavedChanges from "../components/UnsavedChanges";
import { useCallback, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { getTrip, createTrip, updateTrip } from "../services/tripService";
import { getFavorites } from "../services/favoriteService";
import { errorMessage } from "../services/api";
import useResource from "../hooks/useResource";
import LocationSearch from "../components/LocationSearch";
import Checklist from "../components/Checklist";
import Weather from "../components/Weather";
import { Loading, Notice, PageTitle } from "../components/UI";
import { dateKey } from "../utils/dates";

export default function CreateTripPage() {
  const { id } = useParams();
  const location = useLocation();
  const readOnly = location.pathname.startsWith("/view-trip/");
  const load = useCallback(
    () => (id ? getTrip(id) : Promise.resolve(null)),
    [id],
  );
  const { data, loading, error, reload } = useResource(load, null);
  if (loading) return <Loading>Loading trip details…</Loading>;
  if (error)
    return (
      <>
        <Notice>{error}</Notice>
        <div className="actions">
          <button className="button secondary" onClick={reload}>
            Try again
          </button>
          <Link to="/trips">Back to trips</Link>
        </div>
      </>
    );
  return (
    <TripForm
      key={`${id || "new"}-${readOnly}`}
      trip={data}
      readOnly={readOnly}
      destination={location.state?.destination || ""}
    />
  );
}

function TripForm({ trip, readOnly, destination }) {
  const navigate = useNavigate();
  const favorites = useResource(getFavorites);
  const [form, setForm] = useState({
    destination: trip?.destination || destination,
    startDate: dateKey(trip?.startDate),
    endDate: dateKey(trip?.endDate),
    budget: trip?.budget ?? "",
    hotel: Boolean(trip?.hotel),
    flight: Boolean(trip?.flight),
    carRental: Boolean(trip?.carRental),
    activities: Boolean(trip?.activities),
  });
  const [dirty, setDirty] = useState(false);
  const [tasks, setTasks] = useState([]);
  const [task, setTask] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const change = (key, value) => {
    setForm((previous) => ({ ...previous, [key]: value }));
    setDirty(true);
  };
  const submit = async (event) => {
    event.preventDefault();
    setPending(true);
    setError("");
    try {
      const payload = {
        ...form,
        budget: form.budget === "" ? 0 : Number(form.budget),
      };
      const saved = trip
        ? await updateTrip(trip._id, payload)
        : await createTrip({ ...payload, checklist: tasks });
      setDirty(false);
      navigate(`/view-trip/${saved._id}`, {
        state: {
          message: trip
            ? "Trip updated."
            : "Your trip is ready. Start planning the details!",
        },
      });
    } catch (failure) {
      setError(errorMessage(failure));
    } finally {
      setPending(false);
    }
  };
  const message = useLocation().state?.message;
  return (
    <>
      <UnsavedChanges when={dirty && !pending} />
      <PageTitle
        title={
          readOnly
            ? form.destination
            : trip
              ? "Fine-tune your trip."
              : "Where are you heading?"
        }
        action={
          <div className="actions">
            <Link className="button secondary" to="/trips">
              Back to trips
            </Link>
            {readOnly && (
              <Link className="button" to={`/edit-trip/${trip._id}`}>
                Edit trip
              </Link>
            )}
          </div>
        }
      >
        {readOnly
          ? "Your destination, details and everything to remember."
          : "Start with the essentials. The adventure is in the details."}
      </PageTitle>
      <Notice type="success">{message}</Notice>
      <Notice>{error}</Notice>
      <div className="form-page-grid">
        <div className="form-stack">
          <form className="panel form-stack" onSubmit={submit}>
            <div className="section-heading">
              <h2>Trip overview</h2>
              {dirty && <span className="muted">Unsaved changes</span>}
            </div>
            <LocationSearch
              label="Destination"
              value={form.destination}
              onChange={(value) => change("destination", value)}
              onSelect={(item) =>
                change(
                  "destination",
                  [item.name, item.country !== item.name ? item.country : ""]
                    .filter(Boolean)
                    .join(", "),
                )
              }
              disabled={readOnly}
            />
            {!readOnly && favorites.data.length > 0 && (
              <label>
                Or choose a saved destination
                <select
                  value=""
                  onChange={(event) =>
                    change("destination", event.target.value)
                  }
                >
                  <option value="">Choose from favorites</option>
                  {favorites.data.map((item) => (
                    <option key={item._id} value={item.destination}>
                      {item.destination}
                    </option>
                  ))}
                </select>
              </label>
            )}
            <div className="form-grid">
              <label>
                Start date
                <input
                  type="date"
                  required
                  value={form.startDate}
                  onChange={(event) => change("startDate", event.target.value)}
                  disabled={readOnly}
                />
              </label>
              <label>
                End date
                <input
                  type="date"
                  required
                  min={form.startDate || undefined}
                  value={form.endDate}
                  onChange={(event) => change("endDate", event.target.value)}
                  disabled={readOnly}
                />
              </label>
            </div>
            <label>
              Planned budget (RM)
              <input
                type="number"
                min="0"
                max="1000000000"
                step="0.01"
                value={form.budget}
                onChange={(event) => change("budget", event.target.value)}
                disabled={readOnly}
                placeholder="0.00"
              />
            </label>
            <fieldset>
              <legend>What’s included in your plans?</legend>
              <div className="checkbox-grid">
                {[
                  ["hotel", "Hotel"],
                  ["flight", "Flight"],
                  ["carRental", "Car rental"],
                  ["activities", "Activities"],
                ].map(([key, label]) => (
                  <label className="checkbox-label" key={key}>
                    <input
                      type="checkbox"
                      checked={form[key]}
                      disabled={readOnly}
                      onChange={(event) => change(key, event.target.checked)}
                    />
                    {label}
                  </label>
                ))}
              </div>
            </fieldset>
            {!readOnly && (
              <button
                className="button"
                disabled={pending || !form.destination.trim()}
              >
                {pending
                  ? "Saving trip…"
                  : trip
                    ? "Save changes"
                    : "Create trip"}
              </button>
            )}
            {readOnly && (
              <Link className="button" to={`/itinerary/${trip._id}`}>
                Open daily itinerary →
              </Link>
            )}
          </form>
          <section className="panel">
            {trip ? (
              <Checklist tripId={trip._id} readOnly={readOnly} />
            ) : (
              <>
                <h2>Travel checklist</h2>
                <p className="muted">
                  These tasks will be saved together with your new trip.
                </p>
                <form
                  className="inline-form"
                  onSubmit={(event) => {
                    event.preventDefault();
                    if (task.trim()) {
                      setTasks([...tasks, task.trim()]);
                      setTask("");
                      setDirty(true);
                    }
                  }}
                >
                  <label className="grow">
                    New checklist task
                    <input
                      value={task}
                      maxLength={300}
                      onChange={(event) => setTask(event.target.value)}
                      placeholder="Pack chargers, book transfers…"
                    />
                  </label>
                  <button
                    className="button secondary"
                    disabled={!task.trim() || tasks.length >= 100}
                  >
                    + Add task
                  </button>
                </form>
                <ul className="checklist">
                  {tasks.map((value, index) => (
                    <li key={`${index}-${value}`}>
                      <span>□ {value}</span>
                      <button
                        type="button"
                        className="icon-button danger-text"
                        aria-label={`Remove task: ${value}`}
                        onClick={() => {
                          setTasks(
                            tasks.filter((_, taskIndex) => taskIndex !== index),
                          );
                          setDirty(true);
                        }}
                      >
                        ×
                      </button>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </section>
        </div>
        <aside className="form-stack">
          <section className="panel">
            <p className="eyebrow">AT YOUR DESTINATION</p>
            <h2>Current weather</h2>
            <Weather city={form.destination} />
            <p className="muted small-text">
              Current conditions, rather than a forecast for your travel dates.
            </p>
          </section>
          <section className="tip-card">
            <h3>A plan that grows with you.</h3>
            <p>
              Once your trip is saved, open the itinerary to add a hotel,
              arrange your daily stops and see them on the map.
            </p>
          </section>
        </aside>
      </div>
    </>
  );
}
