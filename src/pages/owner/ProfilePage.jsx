import { Navigate, useNavigate } from "react-router-dom";
import { getCurrentUser, getOwnerRegistries, logoutUser } from "../../AppContext.jsx";
import OwnerTopBar from "../../components/owner/OwnerTopBar.jsx";
import BottomNav from "../../components/owner/BottomNav.jsx";
import { UserIcon } from "../../components/owner/icons.jsx";
import "./owner.css";
import "./ProfilePage.css";

// W26 Profile: name, email, number of wishlists, member since, log out.
function ProfilePage() {
  const navigate = useNavigate();
  const user = getCurrentUser();

  // Owner screens need a logged-in user. Logged out → go to the login page.
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const wishlistCount = getOwnerRegistries().length;

  const memberSince = new Date(user.createdAt).toLocaleDateString("en-GB", {
    month: "long",
    year: "numeric",
  });

  function handleLogout() {
    logoutUser();
    navigate("/login");
  }

  return (
    <div className="owner-page">
      <OwnerTopBar showAvatar={false} />

      <main className="owner-content">
        <div className="profile__avatar">
          <UserIcon size={32} />
        </div>

        <h1 className="profile__name">{user.name}</h1>
        <p className="profile__email">{user.email}</p>

        <dl className="profile-card">
          <div className="profile-card__row">
            <dt>Wishlists</dt>
            <dd>{wishlistCount}</dd>
          </div>
          <div className="profile-card__row">
            <dt>Member since</dt>
            <dd>{memberSince}</dd>
          </div>
        </dl>

        <button type="button" className="profile__logout" onClick={handleLogout}>
          Log out
        </button>
      </main>

      <BottomNav />
    </div>
  );
}

export default ProfilePage;