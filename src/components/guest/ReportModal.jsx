import { useEffect, useState } from "react";
import { submitReport } from "../../AppContext.jsx";
import "./ReserveSheet.css"; // same bottom-sheet frame as W14
import "./ReportModal.css";

const REASONS = [
  { value: "inappropriate", label: "Inappropriate content" },
  { value: "spam", label: "Spam or scam" },
  { value: "other", label: "Other" },
];

const DETAILS_LIMIT = 300;

// W19 – Report a public wishlist or one of its gifts. Saved as "open" for the admin (FR-D4).
// Without a giftId it reports the whole wishlist.
function ReportModal({ registryId, giftId, onClose }) {
  const [reason, setReason] = useState("");
  const [details, setDetails] = useState("");
  const [error, setError] = useState("");
  const [isSent, setIsSent] = useState(false);

  // Close with the Escape key (keyboard users, NFR12)
  useEffect(() => {
    function handleKey(event) {
      if (event.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onClose]);

  function handleSubmit(event) {
    event.preventDefault();

    try {
      submitReport({ registryId, giftId, reason, details });
      setIsSent(true);
    } catch (err) {
      setError(err.message);
    }
  }

  const title = giftId ? "Report this gift" : "Report this wishlist";

  return (
    <div className="sheet-overlay" onClick={onClose}>
      <form
        className="sheet"
        role="dialog"
        aria-modal="true"
        aria-labelledby="report-title"
        onClick={(event) => event.stopPropagation()}
        onSubmit={handleSubmit}
        noValidate
      >
        <div className="sheet__handle" aria-hidden="true" />
        <h2 id="report-title" className="sheet__title">{title}</h2>

        {isSent ? (
          <>
            <p className="report__thanks" role="status">Thanks, our team will review this.</p>
            <button type="button" className="guest-btn guest-btn--primary" onClick={onClose}>
              Close
            </button>
          </>
        ) : (
          <>
            <p className="report__intro">Tell us what’s wrong. Our team will review it.</p>

            <fieldset className="report__reasons">
              <legend className="report__legend">Reason</legend>
              {REASONS.map((option) => (
                <label
                  key={option.value}
                  className={`report__option ${reason === option.value ? "report__option--selected" : ""}`}
                >
                  <input
                    type="radio"
                    name="report-reason"
                    value={option.value}
                    checked={reason === option.value}
                    onChange={() => setReason(option.value)}
                  />
                  {option.label}
                </label>
              ))}
            </fieldset>

            {error && <p className="guest-error">{error}</p>}

            <div className="guest-field report__details">
              <label className="guest-label" htmlFor="report-details">Details (optional)</label>
              <textarea
                id="report-details"
                className="guest-input report__textarea"
                value={details}
                maxLength={DETAILS_LIMIT}
                rows={3}
                placeholder="Add anything that helps us review this."
                onChange={(event) => setDetails(event.target.value)}
              />
              <p className="guest-hint">{details.length} / {DETAILS_LIMIT}</p>
            </div>

            <button type="submit" className="guest-btn guest-btn--primary">
              Submit report
            </button>
          </>
        )}
      </form>
    </div>
  );
}

export default ReportModal;