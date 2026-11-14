import { useState } from "react";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import {
  getCurrentUser,
  getRegistryWithGifts,
  updateRegistry,
  VISIBILITY,
} from "../../AppContext.jsx";
import BackHeader from "../../components/owner/BackHeader.jsx";
import "./owner.css";
import "./WishlistSettingsPage.css";

// The three choices on W10 (titles and descriptions from Figma).
const OPTIONS = [
  {
    value: VISIBILITY.PUBLIC,
    title: "Public",
    text: "Anyone with the link can open it and pass it on. Guests can report it.",
  },
  {
    value: VISIBILITY.LINK_ONLY,
    title: "Link only",
    text: "Only the people you send the link to.",
  },
  {
    value: VISIBILITY.PRIVATE,
    title: "Private",
    text: "Only you. Guests can't open it while it's private.",
  },
];

// Returns the owner's registry, or null if it doesn't exist or isn't theirs.
// (getRegistryWithGifts throws in those cases, so we catch and return null.)
function loadRegistry(registryId) {
  try {
    return getRegistryWithGifts(registryId).registry;
  } catch {
    return null;
  }
}

// W10 Wishlist settings – who can see this wishlist.
function WishlistSettingsPage() {
  const navigate = useNavigate();
  const { registryId } = useParams();

  const registry = loadRegistry(registryId);

  const [visibility, setVisibility] = useState(
    registry?.visibility ?? VISIBILITY.LINK_ONLY
  );
  const [error, setError] = useState("");

  // Logged out → login. List missing or not yours → back to Home.
  if (!getCurrentUser()) {
    return <Navigate to="/login" replace />;
  }
  if (!registry) {
    return <Navigate to="/" replace />;
  }

  function handleSave() {
    try {
      updateRegistry(registryId, { visibility });
      navigate(`/my-wishlists/${registryId}`);
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="owner-page">
      <BackHeader to={`/my-wishlists/${registryId}`} />

      <main className="owner-content">
        <h1 className="settings__title">Wishlist settings</h1>
        <p className="settings__subtitle">{registry.name}</p>

        {registry.isHidden && (
          <div className="settings__hidden" role="status">
            <p className="settings__hidden-title">
              This wishlist was hidden by Omnia
            </p>
            <p>
              It broke platform rules, so guests can't see it. It will be
              restored once the issue is resolved.
            </p>
          </div>
        )}

        <h2 className="settings__section-title">Who can see this wishlist?</h2>

        <div className="settings__options">
          {OPTIONS.map((option) => {
            const isSelected = visibility === option.value;

            return (
              <label
                key={option.value}
                className={isSelected ? "option option--selected" : "option"}
              >
                <input
                  type="radio"
                  name="visibility"
                  value={option.value}
                  checked={isSelected}
                  onChange={() => setVisibility(option.value)}
                />
                <span className="option__text">
                  <span className="option__title">{option.title}</span>
                  <span className="option__desc">{option.text}</span>
                </span>
              </label>
            );
          })}
        </div>

        <p className="settings__info">
          Changing visibility keeps existing reservations.
        </p>

        {error && (
          <p className="settings__error" role="alert">
            {error}
          </p>
        )}

        <button type="button" className="settings__button" onClick={handleSave}>
          Save changes
        </button>
      </main>
    </div>
  );
}

export default WishlistSettingsPage;