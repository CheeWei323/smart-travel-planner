import zxcvbn from "zxcvbn";

const labels = ["Very weak", "Weak", "Fair", "Strong", "Very strong"];

export default function PasswordStrength({ password }) {
  // Every accepted password fits this bound. Avoid expensive scoring of oversized input.
  const { score } = zxcvbn(password.slice(0, 72));
  return (
    <div className="password-strength">
      <div className="password-strength-header">
        <small>Password strength</small>
        <small className={`strength-text strength-${score}`}>{labels[score]}</small>
      </div>
      <div className="strength-bar" role="meter" aria-label="Password strength"
        aria-valuemin={0} aria-valuemax={4} aria-valuenow={score} aria-valuetext={labels[score]}>
        {[0, 1, 2, 3].map((index) => (
          <span key={index} className={index < Math.max(1, score) ? `strength-fill strength-${score}` : ""} />
        ))}
      </div>
    </div>
  );
}
