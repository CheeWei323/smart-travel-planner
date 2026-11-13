import { Link } from "react-router-dom";
import {
  FaArrowRight,
  FaMapMarkedAlt,
  FaSuitcase,
  FaWallet,
  FaCalendarAlt,
} from "react-icons/fa";
import { useAuth } from "../hooks/useAuth";
import useResource from "../hooks/useResource";
import { getTrips } from "../services/tripService";
import { getActiveAnnouncements } from "../services/feedbackService";
import { Empty, Loading, Notice, PageTitle } from "../components/UI";
import TripCover from "../components/TripCover";
import { formatDate, money, tripStatus, duration } from "../utils/dates";

export default function DashboardPage() {
  const { user } = useAuth();
  const { data: trips, loading, error, reload } = useResource(getTrips);
  const announcements = useResource(getActiveAnnouncements);
  if (loading) return <Loading />;
  const nextTrip = trips
    .filter((trip) => tripStatus(trip) !== "Completed")
    .sort((a, b) => a.startDate.localeCompare(b.startDate))[0];
  const recent = [...trips]
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, 4);
  const stats = [
    [FaSuitcase, "Your trips", trips.length],
    [
      FaCalendarAlt,
      "Upcoming trips",
      trips.filter((trip) => tripStatus(trip) === "Upcoming").length,
    ],
    [
      FaMapMarkedAlt,
      "Destinations",
      new Set(trips.map((trip) => trip.destination)).size,
    ],
    [
      FaWallet,
      "Planned budget",
      money(trips.reduce((total, trip) => total + trip.budget, 0)),
    ],
  ];
  return (
    <>
      <PageTitle
        title={`Hello, ${user.username}.`}
        action={
          <Link className="button" to="/create-trip">
            + Plan a trip
          </Link>
        }
      >
        A little overview of everywhere you’re going.
      </PageTitle>
      <Notice>{error}</Notice>
      {error && (
        <button className="button secondary" onClick={reload}>
          Try again
        </button>
      )}
      {announcements.data.map((item) => (
        <Notice
          key={item._id}
          type={item.type === "warning" ? "warning" : "info"}
        >
          <strong>{item.title}</strong>
          <p>{item.message}</p>
        </Notice>
      ))}
      <div className="stats-grid">
        {stats.map(([Icon, label, value]) => (
          <div className="stat-card" key={label}>
            <span className="stat-icon">
              <Icon />
            </span>
            <p>{label}</p>
            <strong>{value}</strong>
          </div>
        ))}
      </div>
      <div className="dashboard-grid">
        <section>
          <div className="section-heading">
            <h2>Your next adventure</h2>
            <Link to="/trips">
              All trips <FaArrowRight />
            </Link>
          </div>
          {nextTrip ? (
            <article className="adventure-card">
              <TripCover destination={nextTrip.destination} />
              <div className="adventure-body">
                <span className={`badge ${tripStatus(nextTrip).toLowerCase()}`}>
                  {tripStatus(nextTrip)}
                </span>
                <h2>{nextTrip.destination}</h2>
                <p>
                  <FaCalendarAlt /> {formatDate(nextTrip.startDate)} –{" "}
                  {formatDate(nextTrip.endDate)} · {duration(nextTrip)} days
                </p>
                <div className="actions">
                  <Link className="button" to={`/itinerary/${nextTrip._id}`}>
                    Open itinerary <FaArrowRight />
                  </Link>
                  <Link
                    className="button secondary"
                    to={`/view-trip/${nextTrip._id}`}
                  >
                    Trip details
                  </Link>
                </div>
              </div>
            </article>
          ) : (
            <Empty
              title="Where will you go next?"
              to="/create-trip"
              action="Create your first trip"
            >
              A weekend away or a big adventure — give it a place to begin.
            </Empty>
          )}
        </section>
        <section className="panel">
          <div className="section-heading">
            <h2>Recently planned</h2>
          </div>
          {recent.length ? (
            <div className="recent-list">
              {recent.map((trip) => (
                <Link key={trip._id} to={`/view-trip/${trip._id}`}>
                  <span className="recent-icon">
                    <FaMapMarkedAlt />
                  </span>
                  <span>
                    <strong>{trip.destination}</strong>
                    <small>
                      {formatDate(trip.startDate)} · {money(trip.budget)}
                    </small>
                  </span>
                  <FaArrowRight />
                </Link>
              ))}
            </div>
          ) : (
            <p className="muted">Your recent plans will appear here.</p>
          )}
          <div className="tip-card">
            <p className="eyebrow">A LITTLE TRAVEL TIP</p>
            <h3>Make the details easy.</h3>
            <p>
              Add your packing tasks and daily stops before you leave. Future
              you will thank you.
            </p>
            <Link to="/itinerary">Explore your itineraries →</Link>
          </div>
        </section>
      </div>
    </>
  );
}
