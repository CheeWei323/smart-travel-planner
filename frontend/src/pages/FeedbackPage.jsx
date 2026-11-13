import { useState } from "react";
import useResource from "../hooks/useResource";
import { getMyFeedback, submitFeedback } from "../services/feedbackService";
import { errorMessage } from "../services/api";
import { Empty, Loading, Notice, PageTitle } from "../components/UI";
import { formatDate } from "../utils/dates";
export default function FeedbackPage() {
  const {
    data: items,
    loading,
    error,
    reload,
    setData,
  } = useResource(getMyFeedback);
  const [result, setResult] = useState(null);
  const [pending, setPending] = useState(false);
  const submit = async (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    setPending(true);
    setResult(null);
    try {
      const item = await submitFeedback(Object.fromEntries(data));
      setData((previous) => [item, ...previous]);
      form.reset();
      setResult({
        type: "success",
        message:
          "Thanks for helping us improve. You can follow the response below.",
      });
    } catch (failure) {
      setResult({ type: "error", message: errorMessage(failure) });
    } finally {
      setPending(false);
    }
  };
  return (
    <>
      <PageTitle title="A little help goes a long way.">
        Share an idea, report a problem or check a response from our team.
      </PageTitle>
      <div className="feedback-grid">
        <form className="panel form-stack" onSubmit={submit}>
          <h2>Send feedback</h2>
          <Notice type={result?.type}>{result?.message}</Notice>
          <label>
            Category
            <select name="category">
              <option value="suggestion">Suggestion</option>
              <option value="bug">Bug report</option>
              <option value="other">Other</option>
            </select>
          </label>
          <label>
            Subject
            <input
              name="subject"
              required
              maxLength={120}
              placeholder="What’s on your mind?"
            />
          </label>
          <label>
            Your message
            <textarea
              name="message"
              rows={6}
              required
              maxLength={2000}
              placeholder="Tell us a little more…"
            />
          </label>
          <button className="button" disabled={pending}>
            {pending ? "Sending…" : "Send feedback"}
          </button>
        </form>
        <section>
          <div className="section-heading">
            <h2>Your conversations</h2>
            <button className="button secondary small" onClick={reload}>
              Refresh
            </button>
          </div>
          <Notice>{error}</Notice>
          {loading ? (
            <Loading>Loading feedback…</Loading>
          ) : !items.length ? (
            <Empty title="We’re here when you need us">
              Your submitted feedback and replies will appear here.
            </Empty>
          ) : (
            <div className="form-stack">
              {items.map((item) => (
                <article className="panel" key={item._id}>
                  <div className="section-heading">
                    <span className="eyebrow">
                      {item.category} · {formatDate(item.createdAt)}
                    </span>
                    <span className={`badge ${item.status}`}>
                      {item.status}
                    </span>
                  </div>
                  <h3>{item.subject}</h3>
                  <p className="preserve-lines">{item.message}</p>
                  {item.adminReply && (
                    <div className="admin-reply">
                      <strong>Reply from TravelWise</strong>
                      <p className="preserve-lines">{item.adminReply}</p>
                    </div>
                  )}
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </>
  );
}
