import { Link } from "react-router-dom";
import { FaCompass } from "react-icons/fa";
export default function AuthLayout({ title, subtitle, children }) {
  return (
    <div className="auth-page">
      <section className="auth-story">
        <Link className="brand" to="/">
          <span className="brand-icon">
            <FaCompass />
          </span>
          <span>TravelWise</span>
        </Link>
        <div>
          <p className="eyebrow">LESS PLANNING CHAOS. MORE POSSIBILITY.</p>
          <h1>
            Your next chapter
            <br />
            starts somewhere new.
          </h1>
          <p>
            Keep your destinations, daily plans and little travel details
            together. Leave more room for the adventure.
          </p>
          <div className="story-tags">
            <span>✦ Plan your days</span>
            <span>✦ Find your places</span>
            <span>✦ Travel your way</span>
          </div>
        </div>
        <small>Made for the journeys you’ll remember.</small>
      </section>
      <main className="auth-main">
        <div className="auth-card">
          <p className="eyebrow">WELCOME TO TRAVELWISE</p>
          <h1>{title}</h1>
          <p className="muted">{subtitle}</p>
          {children}
        </div>
      </main>
    </div>
  );
}
