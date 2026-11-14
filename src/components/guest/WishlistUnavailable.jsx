import "./WishlistUnavailable.css";

// W12b: shown when a guest opens a private, hidden, draft or deleted wishlist.
// Same message for every case, so we never reveal why (Phase 3, G1).
function WishlistUnavailable() {
  return (
    <section className="unavailable">
      <div className="unavailable__icon" aria-hidden="true">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="4" y="11" width="16" height="10" rx="2" />
          <path d="M8 11V7a4 4 0 0 1 8 0v4" />
        </svg>
      </div>

      <h1 className="unavailable__title">This wishlist isn’t available</h1>

      <p className="unavailable__text">
        It may be private, hidden, or no longer exist. Ask the person who shared it for an updated link.
      </p>
    </section>
  );
}

export default WishlistUnavailable;


