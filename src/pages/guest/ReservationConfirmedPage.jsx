import { Link, useLocation, useParams } from "react-router-dom";
import "./guest.css";
import "./ReservationConfirmedPage.css";

// W15 – Reservation confirmed (G4).
// ReserveSheet sends the details here with navigate(..., { state }).
function ReservationConfirmedPage() {
  const { registryId } = useParams();
  const location = useLocation();
  const details = location.state; // { code, email, giftName, productUrl }, or null

  const backLink = `/wishlist/${registryId}`;

  // Opened directly or after a refresh: the details are gone, so we can't show the code again
  if (!details) {
    return (
      <div className="guest-page">
        <main className="confirmed">
          <h1 className="confirmed__title">Nothing to show here</h1>
          <p className="confirmed__text">
            Your code was shown right after reserving. Use “Manage my reservation” with the code from your email.
          </p>
          <Link className="guest-btn guest-btn--outline" to={backLink}>
            Back to wishlist
          </Link>
        </main>
      </div>
    );
  }

  return (
    <div className="guest-page">
      <main className="confirmed">
        <Link className="guest-back" to={backLink}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="m15 18-6-6 6-6" />
          </svg>
          Back to wishlist
        </Link>

        <div className="confirmed__icon" aria-hidden="true">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 6 9 17l-5-5" />
          </svg>
        </div>

        <div className="confirmed__heading">
          <h1 className="confirmed__title">You reserved it!</h1>
          <p className="confirmed__text">
            “{details.giftName}” is now marked as reserved, so no one else will buy it.
          </p>
        </div>

        <div className="confirmed__code-card">
          <span>Your reservation code</span>
          <strong className="confirmed__code">{details.code}</strong>
        </div>

        <div className="confirmed__email" role="status">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <rect x="2" y="4" width="20" height="16" rx="2" />
            <path d="m22 7-10 6L2 7" />
          </svg>
          <div>
            <strong>Sent to {details.email}</strong>
            <p>We emailed your code and a cancel link so you can keep them safe.</p>
          </div>
        </div>

        {details.productUrl && (
          <a className="guest-btn guest-btn--outline" href={details.productUrl} target="_blank" rel="noopener noreferrer">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
              <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
            </svg>
            Buy from store
          </a>
        )}

        <Link className="guest-link" to={backLink}>
          Back to wishlist
        </Link>
      </main>
    </div>
  );
}

export default ReservationConfirmedPage;