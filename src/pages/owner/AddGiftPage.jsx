import { useState } from "react";
import { Navigate, useParams } from "react-router-dom";
import {
  fetchProductInfo,
  getCurrentUser,
  getRegistryWithGifts,
} from "../../AppContext.jsx";
import BackHeader from "../../components/owner/BackHeader.jsx";
import "./owner.css";
import "./AddGiftPage.css";

// Returns the owner's registry, or null if it's missing or not theirs.
function loadRegistry(registryId) {
  try {
    return getRegistryWithGifts(registryId).registry;
  } catch {
    return null;
  }
}

// W6 Add a gift by link (step 2 of 3). W7/W7b (the gift form) are added here next.
function AddGiftPage() {
  const { registryId } = useParams();
  const registry = loadRegistry(registryId);

  const [mode, setMode] = useState("link");
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [product, setProduct] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState("");

  if (!getCurrentUser()) {
    return <Navigate to="/login" replace />;
  }
  if (!registry) {
    return <Navigate to="/" replace />;
  }

  function handleFetch() {
    setError("");
    setProduct(null);
    setLoading(true);

    setTimeout(() => {
      try {
        setProduct(fetchProductInfo(url));
      } catch (err) {
        setError(err.message);
        setMode("manual");
      } finally {
        setLoading(false);
      }
    }, 1200);
  }

  return (
    <div className="owner-page">
      <BackHeader
        to={`/my-wishlists/${registryId}`}
        right={<span>2 of 3 · Gifts</span>}
      />

      <div className="steps" aria-hidden="true">
        <span className="steps__bar steps__bar--done" />
        <span className="steps__bar steps__bar--done" />
        <span className="steps__bar" />
      </div>

      <main className="owner-content">
        <h1 className="gift__title">Add a gift</h1>
        <p className="gift__subtitle">Help them get it just right.</p>

        <div className="tabs" role="tablist">
          <button
            type="button"
            role="tab"
            className={mode === "link" ? "tabs__tab tabs__tab--active" : "tabs__tab"}
            onClick={() => setMode("link")}
          >
            Paste a link
          </button>
          <button
            type="button"
            role="tab"
            className={
              mode === "manual" ? "tabs__tab tabs__tab--active" : "tabs__tab"
            }
            onClick={() => setMode("manual")}
          >
            Enter manually
          </button>
        </div>

        {mode === "link" && !showForm && (
          <>
            <label className="field">
              <span className="field__label">Product link</span>
              <span className="link-input">
                <input
                  className="link-input__field"
                  value={url}
                  onChange={(event) => setUrl(event.target.value)}
                  placeholder="https://www.amazon.sa/dp/…"
                />
                <button
                  type="button"
                  className="link-input__button"
                  onClick={handleFetch}
                  disabled={loading || !url.trim()}
                >
                  Fetch details
                </button>
              </span>
            </label>

            {loading && (
              <div className="fetching" role="status">
                <p>Fetching title, image and price…</p>
                <div className="fetching__track">
                  <div className="fetching__fill" />
                </div>
              </div>
            )}

            {product && <p className="gift__found">✓ Details found: {product.name}</p>}

            <p className="gift__hint">
              Works with supported stores. You can always enter a gift manually.
            </p>

            <button
              type="button"
              className="gift__continue"
              disabled={!product}
              onClick={() => setShowForm(true)}
            >
              Continue
            </button>
          </>
        )}

        {/* W7 (auto-filled form) and W7b (manual form) are built tomorrow. */}
        {(showForm || mode === "manual") && (
          <>
            {error && (
              <p className="gift__error" role="alert">
                {error}
              </p>
            )}
            <p className="gift__hint">The gift form is coming next (W7 / W7b).</p>
          </>
        )}
      </main>
    </div>
  );
}

export default AddGiftPage;