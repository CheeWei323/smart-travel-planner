import UnsavedChanges from "../components/UnsavedChanges";
import { lazy, Suspense, useCallback, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getTrip, getTrips, updateTrip } from "../services/tripService";
import { getCoordinates } from "../services/geocodeService";
import { errorMessage } from "../services/api";
import useResource from "../hooks/useResource";
import { Empty, Loading, Notice, PageTitle } from "../components/UI";
import LocationSearch from "../components/LocationSearch";
import TripCover from "../components/TripCover";
import { dayDate, duration, formatDate, tripStatus } from "../utils/dates";
import { orderNearby } from "../utils/route";
const ItineraryMap = lazy(() => import("../components/ItineraryMap"));
const noStops = [];

export default function ItineraryPage() {
  const { id } = useParams();
  return id ? <TripItinerary key={id} id={id} /> : <ItineraryList />;
}
function ItineraryList() {
  const { data: trips, loading, error, reload } = useResource(getTrips);
  const [showCompleted, setShowCompleted] = useState(false);
  if (loading) return <Loading />;
  const visible = trips.filter(
    (trip) => showCompleted || tripStatus(trip) !== "Completed",
  );
  return (
    <>
      <PageTitle title="Make every day your own.">
        Choose a trip to arrange hotels, favorite places and daily adventures.
      </PageTitle>
      <Notice>{error}</Notice>
      {error && (
        <button className="button secondary" onClick={reload}>
          Try again
        </button>
      )}
      <label className="checkbox-label filter-toggle">
        <input
          type="checkbox"
          checked={showCompleted}
          onChange={(event) => setShowCompleted(event.target.checked)}
        />
        Include completed trips
      </label>
      {!visible.length ? (
        <Empty
          title="A great day starts with a little plan"
          to="/create-trip"
          action="Create a trip"
        >
          Create a trip, then add the places you want to explore.
        </Empty>
      ) : (
        <div className="trip-grid">
          {visible.map((trip) => (
            <article className="trip-card" key={trip._id}>
              <TripCover destination={trip.destination} />
              <div className="trip-card-body">
                <span className={`badge ${tripStatus(trip).toLowerCase()}`}>
                  {tripStatus(trip)}
                </span>
                <h2>{trip.destination}</h2>
                <p className="muted">
                  {formatDate(trip.startDate)} – {formatDate(trip.endDate)}
                </p>
                <Link className="button full" to={`/itinerary/${trip._id}`}>
                  Plan {duration(trip)} {duration(trip) === 1 ? "day" : "days"}{" "}
                  →
                </Link>
              </div>
            </article>
          ))}
        </div>
      )}
    </>
  );
}
function TripItinerary({ id }) {
  const load = useCallback(() => getTrip(id), [id]);
  const { data, loading, error, reload } = useResource(load, null);
  if (loading) return <Loading>Loading itinerary…</Loading>;
  if (error)
    return (
      <>
        <Notice>{error}</Notice>
        <button className="button secondary" onClick={reload}>
          Try again
        </button>
        <Link to="/itinerary">Back to itineraries</Link>
      </>
    );
  return <ItineraryEditor trip={data} />;
}
function ItineraryEditor({ trip }) {
  const initial = {
    dailyHotels: trip.itinerary?.dailyHotels || {},
    days: trip.itinerary?.days || {},
  };
  const [plan, setPlan] = useState(initial);
  const [saved, setSaved] = useState(JSON.stringify(initial));
  const [day, setDay] = useState(1);
  const [target, setTarget] = useState("activity");
  const [query, setQuery] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const loadCenter = useCallback(
    () => getCoordinates(trip.destination).catch(() => null),
    [trip.destination],
  );
  const geocode = useResource(loadCenter, null);
  const center = useMemo(
    () =>
      geocode.data ? [geocode.data.latitude, geocode.data.longitude] : null,
    [geocode.data],
  );
  const hotel = plan.dailyHotels[day] || null;
  const stops = plan.days[day] || noStops;
  const dirty = JSON.stringify(plan) !== saved;
  const change = (next) => {
    setPlan(next);
    setMessage("");
  };
  const add = (item) => {
    setError("");
    if (target === "activity" && stops.length >= 50) {
      setError("A day can contain up to 50 activities.");
      return;
    }
    const place = {
      name: item.name,
      address: item.address || "",
      lat: item.lat,
      lon: item.lon,
    };
    change(
      target === "hotel"
        ? { ...plan, dailyHotels: { ...plan.dailyHotels, [day]: place } }
        : { ...plan, days: { ...plan.days, [day]: [...stops, place] } },
    );
    setQuery("");
  };
  const move = (index, direction) => {
    const next = [...stops];
    [next[index], next[index + direction]] = [
      next[index + direction],
      next[index],
    ];
    change({ ...plan, days: { ...plan.days, [day]: next } });
  };
  const removeHotel = () => {
    const hotels = { ...plan.dailyHotels };
    delete hotels[day];
    change({ ...plan, dailyHotels: hotels });
  };
  const save = async () => {
    setPending(true);
    setError("");
    setMessage("");
    try {
      const updated = await updateTrip(trip._id, { itinerary: plan });
      const next = {
        dailyHotels: updated.itinerary?.dailyHotels || {},
        days: updated.itinerary?.days || {},
      };
      setPlan(next);
      setSaved(JSON.stringify(next));
      setMessage("Itinerary saved. Your plans are up to date.");
    } catch (failure) {
      setError(errorMessage(failure));
    } finally {
      setPending(false);
    }
  };
  const manual = (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    const values = new FormData(form);
    add({
      name: values.get("name").trim(),
      address: values.get("address").trim(),
      lat: Number(values.get("lat")),
      lon: Number(values.get("lon")),
    });
    form.reset();
  };
  return (
    <>
      <UnsavedChanges when={dirty && !pending} />
      <PageTitle
        eyebrow="YOUR DAILY ITINERARY"
        title={trip.destination}
        action={
          <div className="actions">
            <Link className="button secondary" to="/itinerary">
              All itineraries
            </Link>
            <button
              className="button"
              disabled={pending || !dirty}
              onClick={save}
            >
              {pending
                ? "Saving…"
                : dirty
                  ? "Save itinerary"
                  : "All changes saved"}
            </button>
          </div>
        }
      >
        {formatDate(trip.startDate)} – {formatDate(trip.endDate)} ·{" "}
        {duration(trip)} days ·{" "}
        <Link to={`/view-trip/${trip._id}`}>Trip details</Link>
      </PageTitle>
      <Notice>{error}</Notice>
      <Notice type="success">{message}</Notice>
      <div className="day-tabs" aria-label="Itinerary days">
        {Array.from({ length: duration(trip) }, (_, index) => (
          <button
            key={index}
            className={day === index + 1 ? "selected" : ""}
            aria-pressed={day === index + 1}
            onClick={() => {
              setDay(index + 1);
              setQuery("");
            }}
          >
            <strong>Day {index + 1}</strong>
            <small>{formatDate(dayDate(trip, index + 1))}</small>
          </button>
        ))}
      </div>
      <div className="itinerary-grid">
        <div className="form-stack">
          <section className="panel">
            <div className="section-heading">
              <h2>Day {day} · Your places</h2>
              {dirty && <span className="badge warning">Unsaved</span>}
            </div>
            <div className="tabs">
              <button
                className={target === "activity" ? "selected" : ""}
                aria-pressed={target === "activity"}
                onClick={() => setTarget("activity")}
              >
                Add activity
              </button>
              <button
                className={target === "hotel" ? "selected" : ""}
                aria-pressed={target === "hotel"}
                onClick={() => setTarget("hotel")}
              >
                Set hotel
              </button>
            </div>
            <LocationSearch
              label={
                target === "hotel" ? "Find your hotel" : "Find a place to visit"
              }
              value={query}
              onChange={setQuery}
              onSelect={add}
            />
            <details className="manual-location">
              <summary>Enter a place manually</summary>
              <form className="form-stack" onSubmit={manual}>
                <label>
                  Place name
                  <input name="name" required maxLength={300} />
                </label>
                <label>
                  Address
                  <input name="address" maxLength={500} />
                </label>
                <div className="form-grid">
                  <label>
                    Latitude
                    <input
                      type="number"
                      name="lat"
                      required
                      min="-90"
                      max="90"
                      step="any"
                    />
                  </label>
                  <label>
                    Longitude
                    <input
                      type="number"
                      name="lon"
                      required
                      min="-180"
                      max="180"
                      step="any"
                    />
                  </label>
                </div>
                <button className="button secondary">
                  {target === "hotel" ? "Set hotel" : "Add activity"}
                </button>
              </form>
            </details>
          </section>
          <section className="hotel-card">
            <div className="section-heading">
              <h2>H · Your hotel</h2>
              {hotel && (
                <button className="button light small" onClick={removeHotel}>
                  Remove hotel
                </button>
              )}
            </div>
            <strong>{hotel?.name || "A place to come back to"}</strong>
            <p>
              {hotel?.address ||
                "Choose a hotel for this day to set your starting point."}
            </p>
          </section>
          <section className="panel">
            <div className="section-heading">
              <h2>Daily stops</h2>
              <button
                className="button secondary small"
                disabled={stops.length < 2}
                onClick={() =>
                  change({
                    ...plan,
                    days: { ...plan.days, [day]: orderNearby(hotel, stops) },
                  })
                }
              >
                Order nearby stops
              </button>
            </div>
            <ol className="stop-list">
              {stops.map((item, index) => (
                <li key={`${index}-${item.name}`}>
                  <span className="stop-number">{index + 1}</span>
                  <div className="grow">
                    <strong>{item.name}</strong>
                    <small>{item.address}</small>
                    <div className="actions">
                      <button
                        className="icon-button"
                        aria-label={`Move ${item.name} up`}
                        disabled={index === 0}
                        onClick={() => move(index, -1)}
                      >
                        ↑
                      </button>
                      <button
                        className="icon-button"
                        aria-label={`Move ${item.name} down`}
                        disabled={index === stops.length - 1}
                        onClick={() => move(index, 1)}
                      >
                        ↓
                      </button>
                      <button
                        className="button ghost-danger small"
                        onClick={() =>
                          change({
                            ...plan,
                            days: {
                              ...plan.days,
                              [day]: stops.filter(
                                (_, position) => position !== index,
                              ),
                            },
                          })
                        }
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ol>
            {!stops.length && (
              <p className="muted">
                A whole day of possibilities. Add your first stop above.
              </p>
            )}
          </section>
        </div>
        <section className="map-panel">
          <Suspense fallback={<Loading>Loading map…</Loading>}>
            <ItineraryMap hotel={hotel} locations={stops} center={center} />
          </Suspense>
          <div className="map-caption">
            <strong>A little perspective on your day.</strong>
            <p>
              Lines show the order of your stops using straight-line distances.
              They do not represent road directions or travel times.
            </p>
          </div>
        </section>
      </div>
    </>
  );
}
