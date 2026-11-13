
import { Link } from "react-router-dom";
import { FaLock, FaEnvelope, FaShieldAlt, FaSignOutAlt, FaExclamationTriangle } from "react-icons/fa";
import { PageTitle } from "../components/UI";

export default function SecurityTipsPage({ admin = false }) {
  const tips = [
    {
      icon: FaLock,
      title: "Use a strong password",
      description:
        "Use at least 15 characters and choose a long, unique passphrase. Spaces are allowed. Avoid common passwords, easily guessed personal information and reusing passwords from other websites.",
    },
    {
      icon: FaEnvelope,
      title: "Be aware of phishing",
      description:
        "Be careful with suspicious emails, messages and links asking for your login details. Always check the sender and website address before entering your password.",
    },
    {
      icon: FaShieldAlt,
      title: "Protect your account",
      description:
        "Never share your password with anyone. Keep your account credentials private and update your password if you suspect someone else has accessed your account.",
    },
    {
      icon: FaSignOutAlt,
      title: "Log out on shared devices",
      description:
        "Always log out after using TravelWise on a public or shared computer. Avoid saving your password on devices that other people can access.",
    },
    {
      icon: FaExclamationTriangle,
      title: "Report suspicious activity",
      description:
        "If you notice unfamiliar account activity or believe your account has been compromised, change your password and contact the application administrator.",
    },
  ];

  return (
    <div className="page-stack">
      <PageTitle title="Security Tips" eyebrow={admin ? "ADMIN PORTAL" : "TRAVELWISE"}
        action={(
          <Link to={admin ? "/admin/settings" : "/profile"} className="button secondary">
            Back to Account Settings
          </Link>
        )}>
        Learn how to keep your TravelWise account and personal information safe.
      </PageTitle>

      <section className="panel form-stack">
        <h2>Protect Your Account</h2>
        <p>
          Follow these security practices whenever you use TravelWise.
          Good security habits help protect your account and personal information.
        </p>

        <div className="security-tips-list">
          {tips.map(({ icon: Icon, title, description }) => (
            <article className="security-tip" key={title}>
              <span className="security-tip-icon">
                <Icon />
              </span>
              <div>
                <h3>{title}</h3>
                <p>{description}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="panel">
        <h2>Privacy Information</h2>
        <p>
          Learn how TravelWise collects, uses and protects your personal information.
        </p>
        <Link to="/privacy-policy">Read our Privacy Policy</Link>
      </section>
    </div>
  );
}
