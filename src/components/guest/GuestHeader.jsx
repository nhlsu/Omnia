import "./GuestHeader.css";

// Omnia logo bar at the top of the guest screens (W12, W12b, W19).
function GuestHeader() {
  return (
    <header className="guest-header">
      <span className="guest-header__logo">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <rect x="3" y="8" width="18" height="4" rx="1" />
          <path d="M12 8v13M19 12v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7" />
          <path d="M7.5 8a2.5 2.5 0 0 1 0-5C10 3 12 8 12 8s2-5 4.5-5a2.5 2.5 0 0 1 0 5" />
        </svg>
        omnia
      </span>
    </header>
  );
}

export default GuestHeader;

