import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import useResource from "../hooks/useResource";
import { getTrips, deleteTrip } from "../services/tripService";
import {
  getFavorites,
  addFavorite,
  deleteFavorite,
} from "../services/favoriteService";
import { errorMessage } from "../services/api";
import {
  ConfirmAction,
  Empty,
  Loading,
  Notice,
  PageTitle,
} from "../components/UI";
import LocationSearch from "../components/LocationSearch";
import TripCover from "../components/TripCover";
import { formatDate, money, tripStatus, duration } from "../utils/dates";
const load = async () => {
  const [trips, favorites] = await Promise.all([getTrips(), getFavorites()]);
  return { trips, favorites };
};

export default function TripsPage() {
  const { data, loading, error, reload, setData } = useResource(load, {
    trips: [],
    favorites: [],
  });
  const [query, setQuery] = useState("");
  const [tab, setTab] = useState("All");
  const [favorite, setFavorite] = useState("");
  const [pending, setPending] = useState(false);
  const [actionError, setActionError] = useState("");
  const navigate = useNavigate();
  const add = async (event) => {
    event.preventDefault();
    setPending(true);
    setActionError("");
    try {
      const item = await addFavorite(favorite);
      setData((previous) => ({
        ...previous,
        favorites: [item, ...previous.favorites],
      }));
      setFavorite("");
    } catch (failure) {
      setActionError(errorMessage(failure));
    } finally {
      setPending(false);
    }
  };
  const remove = async (id) => {
    await deleteTrip(id);
    setData((previous) => ({
      ...previous,
      trips: previous.trips.filter((trip) => trip._id !== id),
    }));
  };
  const removeFavorite = async (id) => {
    try {
      await deleteFavorite(id);
      setData((previous) => ({
        ...previous,
        favorites: previous.favorites.filter((item) => item._id !== id),
      }));
    } catch (failure) {
      setActionError(errorMessage(failure));
    }
  };
  if (loading) return <Loading />;
  const visible = data.trips
    .filter(
      (trip) =>
        (tab === "All" || tripStatus(trip) === tab) &&
        trip.destination.toLowerCase().includes(query.toLowerCase()),
    )
    .sort((a, b) =>
      tab === "Completed"
        ? b.endDate.localeCompare(a.endDate)
        : a.startDate.localeCompare(b.startDate),
    );
  return (
    <>
      <PageTitle
        title="Your trips, all together."
        action={
          <Link className="button" to="/create-trip">
            + Create a trip
          </Link>
        }
      >
        From the first idea to the last day away.
      </PageTitle>
      <Notice>{error || actionError}</Notice>
      {error && (
        <button className="button secondary" onClick={reload}>
          Try again
        </button>
      )}
      <section className="panel favorites-panel">
        <div>
          <p className="eyebrow">YOUR SOMEDAY LIST</p>
          <h2>Favorite destinations</h2>
          <p className="muted">Save a place now. Make it a plan later.</p>
        </div>
        <form className="inline-form" onSubmit={add}>
          <LocationSearch
            value={favorite}
            onChange={setFavorite}
            onSelect={(item) =>
              setFavorite(
                [item.name, item.country !== item.name ? item.country : ""]
                  .filter(Boolean)
                  .join(", "),
              )
            }
            label="Add a favorite destination"
          />
          <button
            className="button secondary"
            disabled={pending || !favorite.trim()}
          >
            {pending ? "Saving…" : "+ Save place"}
          </button>
        </form>
        <div className="favorite-chips">
          {data.favorites.map((item) => (
            <div className="favorite-chip" key={item._id}>
              <button
                onClick={() =>
                  navigate("/create-trip", {
                    state: { destination: item.destination },
                  })
                }
                title="Plan a trip here"
              >
                ♡ {item.destination}
              </button>
              <button
                aria-label={`Remove ${item.destination} from favorites`}
                onClick={() => removeFavorite(item._id)}
              >
                ×
              </button>
            </div>
          ))}
          {!data.favorites.length && (
            <span className="muted">
              Your favorite places will appear here.
            </span>
          )}
        </div>
      </section>
      <div className="list-toolbar">
        <div className="tabs" aria-label="Filter trips">
          {["All", "Upcoming", "Active", "Completed"].map((value) => (
            <button
              key={value}
              className={tab === value ? "selected" : ""}
              aria-pressed={tab === value}
              onClick={() => setTab(value)}
            >
              {value}
            </button>
          ))}
        </div>
        <label className="search-label">
          <span className="sr-only">Search trips</span>
          <input
            placeholder="Search your trips…"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </label>
      </div>
      {!visible.length ? (
        <Empty
          title={
            query || tab !== "All"
              ? "No matching trips"
              : "Your next adventure is waiting"
          }
          to="/create-trip"
          action="Plan a trip"
        >
          {query || tab !== "All"
            ? "Try another search or choose a different filter."
            : "Choose a destination and start making it yours."}
        </Empty>
      ) : (
        <div className="trip-grid">
          {visible.map((trip) => (
            <article className="trip-card" key={trip._id}>
              <div className="cover-wrap">
                <TripCover destination={trip.destination} />
                <span className={`badge ${tripStatus(trip).toLowerCase()}`}>
                  {tripStatus(trip)}
                </span>
              </div>
              <div className="trip-card-body">
                <h2>
                  <Link to={`/view-trip/${trip._id}`}>{trip.destination}</Link>
                </h2>
                <p className="muted">
                  {formatDate(trip.startDate)} – {formatDate(trip.endDate)}
                </p>
                <div className="trip-meta">
                  <span>
                    {duration(trip)} {duration(trip) === 1 ? "day" : "days"}
                  </span>
                  <strong>{money(trip.budget)}</strong>
                </div>
                <div className="actions wrap">
                  <Link className="button small" to={`/itinerary/${trip._id}`}>
                    Itinerary
                  </Link>
                  <Link
                    className="button secondary small"
                    to={`/view-trip/${trip._id}`}
                  >
                    View
                  </Link>
                  <Link
                    className="button secondary small"
                    to={`/edit-trip/${trip._id}`}
                  >
                    Edit
                  </Link>
                  <ConfirmAction
                    label="Delete"
                    title={`Delete ${trip.destination}?`}
                    className="button ghost-danger small"
                    onConfirm={() => remove(trip._id)}
                  >
                    This will permanently remove the trip, itinerary and
                    checklist.
                  </ConfirmAction>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </>
  );
}
