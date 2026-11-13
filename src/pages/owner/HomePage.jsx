import { Link, Navigate } from "react-router-dom";
import { getCurrentUser } from "../../AppContext.jsx";
import OwnerTopBar from "../../components/owner/OwnerTopBar.jsx";
import { GiftIcon } from "../../components/owner/icons.jsx";
import "./owner.css";
import "./HomePage.css";

// W4 Home (and W4b, the first-visit empty state).
function HomePage() {
  const user = getCurrentUser();

  // Owner screens need a logged-in user. Logged out → go to the login page.
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // TODO 5: only the first name for the greeting ("Nadiah Albinali" → "Nadiah").
  const firstName = user.name.split(" ")[0];

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
      </main>
    </div>
  );
}

export default HomePage;