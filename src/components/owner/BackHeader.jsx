import { Link } from "react-router-dom";
import "./BackHeader.css";

// "‹ Back" bar at the top of owner screens (W5, W8, W9, W10, W11).
// Usage: <BackHeader to="/" label="Back" right={<span>1 of 3 · Details</span>} />
function BackHeader({ to, label = "Back", right = null }) {
  return (
    <header className="back-header">
      <Link to={to} className="back-header__link">
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="m15 18-6-6 6-6" />
        </svg>
        {label}
      </Link>

      {right && <div className="back-header__right">{right}</div>}
    </header>
  );
}

export default BackHeader;