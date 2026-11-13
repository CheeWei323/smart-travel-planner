
import { Link } from "react-router-dom";
import AuthLayout from "../components/AuthLayout";

export default function PrivacyPolicyPage() {
  return (
    <AuthLayout
      title="Privacy Policy"
      subtitle="How Smart Travel Planner collects and protects your information."
    >
      <div className="privacy-policy">
        <p><small>Last updated: 13 November 2026</small></p>

        <h3>1. Information We Collect</h3>
        <p>
          Smart Travel Planner collects information provided by users,
          including usernames, email addresses, passwords and travel
          information such as destinations, travel dates, budgets and
          itineraries. Users may also submit feedback through the application.
          Passwords are stored in hashed form rather than as plain text.
        </p>

        <h3>2. General Principle</h3>
        <p>
          Personal information is collected and processed for legitimate
          application purposes, including account management, travel
          planning, saving travel records and handling user feedback.
          Information should only be collected when it is relevant to
          these purposes.
        </p>

        <h3>3. Notice and Choice Principle</h3>
        <p>
          This Privacy Policy explains what personal information is
          collected and how it is used. Users must acknowledge and agree
          to this policy during registration before creating an account.
        </p>

        <h3>4. Disclosure Principle</h3>
        <p>
          Personal information may be accessed by authorised administrators
          when necessary to manage the application, respond to feedback
          or provide support. Information may also be processed by service
          providers involved in operating the application. It should not
          be disclosed for unrelated purposes or to unauthorised parties.
        </p>

        <h3>5. Security Principle</h3>
        <p>
          Reasonable security measures are used to protect personal
          information. These include password hashing, authentication
          and access controls. Additional safeguards, such as encryption
          of selected user data, are being implemented as part of the
          application's security improvements.
        </p>

        <h3>6. Retention Principle</h3>
        <p>
          Personal information should not be retained longer than
          necessary for the purposes for which it was collected,
          subject to applicable legal and operational requirements.
          Users may request account deletion through the application's
          available account functions or the designated support channel.
        </p>

        <h3>7. Data Integrity Principle</h3>
        <p>
          Users should provide accurate and up-to-date information.
          The application provides account and travel management
          functions to help users maintain the accuracy of their
          personal information.
        </p>

        <h3>8. Access Principle</h3>
        <p>
          Users may request access to or correction of their personal
          information through the designated support channel. The
          application is also being improved to provide users with
          a downloadable copy of their personal data.
        </p>

        <h3>9. Contact</h3>
        <p>
          For privacy questions, access requests, correction requests
          or deletion requests, please contact the application
          administrator through the project's designated support channel.
        </p>

        <p>
          This policy describes the intended data practices of Smart
          Travel Planner with reference to Malaysia's Personal Data
          Protection Act 2010 (PDPA). It should be reviewed whenever
          the application's data collection or processing practices change.
        </p>

        <p>
          <Link to="/register">Return</Link>
        </p>
      </div>
    </AuthLayout>
  );
}
