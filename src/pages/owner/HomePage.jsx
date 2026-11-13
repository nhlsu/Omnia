import { Navigate } from "react-router-dom";
import { getCurrentUser } from "../../AppContext.jsx";
import OwnerTopBar from "../../components/owner/OwnerTopBar.jsx";
import "./owner.css";
import "./HomePage.css";

// W4 Home (and W4b, the first-visit empty state).
function HomePage() {
  const user = getCurrentUser();

  // Owner screens need a logged-in user. Logged out → go to the login page.
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="owner-page">
      <OwnerTopBar />

      <main className="owner-content">
        <p>Home is coming together…</p>
      </main>
    </div>
  );
}

export default HomePage;