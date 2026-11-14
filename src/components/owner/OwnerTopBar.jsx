import { Link } from "react-router-dom";
import { getCurrentUser } from "../../AppContext.jsx";
import { GiftIcon } from "./icons.jsx";
import "./OwnerTopBar.css";

// Logo bar with the profile avatar (W4). The avatar opens Profile (W26).
// On Profile itself, use <OwnerTopBar showAvatar={false} /> (Figma W26 shows only the logo).
function OwnerTopBar({ showAvatar = true }) {
  const user = getCurrentUser();
  const initial = user?.name ? user.name[0].toUpperCase() : "?";

  return (
    <header className="owner-topbar">
      <span className="owner-topbar__logo">
        <GiftIcon size={20} />
        omnia
      </span>

      {showAvatar && (
        <Link
          to="/profile"
          className="owner-topbar__avatar"
          aria-label="Profile"
        >
          {initial}
        </Link>
      )}
    </header>
  );
}

export default OwnerTopBar;