import { NavLink } from "react-router-dom";
import { getOwnerRegistries } from "../../AppContext.jsx";
import { GiftIcon, HomeIcon, UserIcon } from "./icons.jsx";
import "./BottomNav.css";

// Bottom tabs on owner screens (W4, W8, W26).
function BottomNav() {
  // getOwnerRegistries() is already sorted newest first.
  // "My lists" opens the newest wishlist (W8). With no lists yet, it opens
  // Create wishlist (W5), so it never points at "/" and Home stays the only active tab.
  const registries = getOwnerRegistries();
  const myListsPath = registries.length
    ? `/my-wishlists/${registries[0].id}`
    : "/my-wishlists/new";

  function tabClass({ isActive }) {
    return isActive
      ? "bottom-nav__tab bottom-nav__tab--active"
      : "bottom-nav__tab";
  }

  return (
    <nav className="bottom-nav" aria-label="Main">
      <NavLink to="/" end className={tabClass}>
        <HomeIcon size={22} />
        <span>Home</span>
      </NavLink>
      <NavLink to={myListsPath} className={tabClass}>
        <GiftIcon size={22} />
        <span>My lists</span>
      </NavLink>
      <NavLink to="/profile" className={tabClass}>
        <UserIcon size={22} />
        <span>Profile</span>
      </NavLink>
    </nav>
  );
}

export default BottomNav;