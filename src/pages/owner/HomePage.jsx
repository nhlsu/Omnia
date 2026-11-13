import { Link, Navigate } from "react-router-dom";
import {
  getCurrentUser,
  getOwnerRegistries,
  REGISTRY_STATUS,
  VISIBILITY,
} from "../../AppContext.jsx";
import OwnerTopBar from "../../components/owner/OwnerTopBar.jsx";
import BottomNav from "../../components/owner/BottomNav.jsx";
import { GiftIcon } from "../../components/owner/icons.jsx";
import "./owner.css";
import "./HomePage.css";

// Badge text for each visibility value (W4 cards, W10 settings).
const VISIBILITY_LABELS = {
  [VISIBILITY.PUBLIC]: "Public",
  [VISIBILITY.LINK_ONLY]: "Link only",
  [VISIBILITY.PRIVATE]: "Private",
};

// "2026-10-24" → "24 Oct 2026". No date → "No date" (W4 shows both).
function formatDate(date) {
  if (!date) {
    return "No date";
  }

  return new Date(date).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

// W4 Home (and W4b, the first-visit empty state).
function HomePage() {
  const user = getCurrentUser();

  // Owner screens need a logged-in user. Logged out → go to the login page.
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const firstName = user.name.split(" ")[0];

  // Get the current owner's wishlists (newest first).
  const registries = getOwnerRegistries();

  return (
    <div className="owner-page">
      <OwnerTopBar />

      <main className="owner-content">
        <h1 className="home__greeting">Hello, {firstName}</h1>
        <p className="home__subtitle">Good moments start with a little wish.</p>

        <section className="home-hero">
          <div className="home-hero__top">
            <h2 className="home-hero__title">
              Big dreams.
              <br />
              Little wishlists.
            </h2>
            <GiftIcon size={28} />
          </div>

          <p className="home-hero__text">
            Collect the gifts you love and let your favourite people be part of the joy.
          </p>

          <Link to="/my-wishlists/new" className="home-hero__button">
            + Create a wishlist
          </Link>
        </section>

        <h2 className="home__section-title">My wishlists</h2>

        {registries.length === 0 ? (
          <div className="home-empty">
            <GiftIcon size={28} />
            <p className="home-empty__title">Your first wish starts here</p>
            <p className="home-empty__text">
              Make a list for a birthday, graduation, or just because.
            </p>
          </div>
        ) : (
          <div className="home-list">
            {registries.map((registry) => {
              const isDraft = registry.status === REGISTRY_STATUS.DRAFT;
              const badgeText = isDraft
                ? "Draft"
                : VISIBILITY_LABELS[registry.visibility];
              const badgeClass = isDraft
                ? "home-card__badge home-card__badge--draft"
                : "home-card__badge";

              return (
                <Link
                  key={registry.id}
                  to={`/my-wishlists/${registry.id}`}
                  className="home-card"
                >
                  <div className="home-card__info">
                    <p className="home-card__name">{registry.name}</p>
                    <p className="home-card__meta">
                      {registry.occasionName} · {formatDate(registry.date)} ·{" "}
                      {registry.reservedUnits} of {registry.totalUnits} reserved
                    </p>
                  </div>
                  <span className={badgeClass}>{badgeText}</span>
                </Link>
              );
            })}
          </div>
        )}
      </main>

      <BottomNav />
    </div>
  );
}

export default HomePage;