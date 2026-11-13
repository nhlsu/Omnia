import { Link } from "react-router-dom";
import { getCurrentUser } from "../../AppContext.jsx";
import { GiftIcon } from "./icons.jsx";
import "./OwnerTopBar.css";

// Logo bar with the profile avatar (W4). The avatar opens Profile (W26).
function OwnerTopBar() {
  const user = getCurrentUser();

  // TODO 3: the first letter of user.name in capitals ("N" for Nadiah).
  //         Use "?" if there's no user or no name.
  const initial = user?.name ? user.name[0].toUpperCase() : "?";

  return (
    <header className="owner-topbar">
      <span className="owner-topbar__logo">
        <GiftIcon size={20} />
        omnia
      </span>

      <Link
        to="/profile"
        className="owner-topbar__avatar"
        aria-label="Profile"
      >
        {initial}
      </Link>
    </header>
  );
}

export default OwnerTopBar;