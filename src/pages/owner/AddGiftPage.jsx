import { useState } from "react";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import {
  addGift,
  fetchProductInfo,
  getCurrentUser,
  getRegistryWithGifts,
} from "../../AppContext.jsx";
import BackHeader from "../../components/owner/BackHeader.jsx";
import GiftForm from "../../components/owner/GiftForm.jsx";
import { AlertIcon, CheckIcon } from "../../components/owner/icons.jsx";
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

// W6 Add a gift by link → W7 auto-filled form, or W7b manual form (step 2 of 3).
function AddGiftPage() {
  const navigate = useNavigate();
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

  const storeDomain = product
    ? new URL(product.productUrl).hostname.replace(/^www\./, "")
    : "";

  function handleSave(values) {
    addGift({
      registryId,
      ...values,
      storeName: product?.storeName ?? null,
    });
    navigate(`/my-wishlists/${registryId}`);
  }

  const isAutoForm = showForm && product;
  const isManualForm = mode === "manual";

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

        {!isAutoForm && (
          <>
            {mode === "link" && (
              <p className="gift__subtitle">Help them get it just right.</p>
            )}

            <div className="tabs" role="tablist">
              <button
                type="button"
                role="tab"
                className={
                  mode === "link" ? "tabs__tab tabs__tab--active" : "tabs__tab"
                }
                onClick={() => setMode("link")}
              >
                Paste a link
              </button>
              <button
                type="button"
                role="tab"
                className={
                  mode === "manual"
                    ? "tabs__tab tabs__tab--active"
                    : "tabs__tab"
                }
                onClick={() => setMode("manual")}
              >
                Enter manually
              </button>
            </div>
          </>
        )}

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

            {product && (
              <p className="gift__found">✓ Details found: {product.name}</p>
            )}

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

        {/* W7: the fetched details, all editable */}
        {isAutoForm && mode === "link" && (
          <GiftForm
            key="auto"
            variant="auto"
            initial={product}
            onSubmit={handleSave}
            banner={
              <div className="gift-banner gift-banner--success" role="status">
                <CheckIcon size={18} />
                <p>
                  Details filled in from {storeDomain}. Check them before
                  saving.
                </p>
              </div>
            }
          />
        )}

        {/* W7b: manual entry. The yellow banner only shows if the fetch failed. */}
        {isManualForm && (
          <GiftForm
            key="manual"
            variant="manual"
            initial={error ? { productUrl: url } : {}}
            onSubmit={handleSave}
            banner={
              error ? (
                <div className="gift-banner gift-banner--warning" role="status">
                  <AlertIcon size={18} />
                  <div>
                    <p className="gift-banner__title">
                      We can't auto-fill from this store yet
                    </p>
                    <p>
                      Enter the details below. Your link is kept as the purchase
                      link.
                    </p>
                  </div>
                </div>
              ) : null
            }
          />
        )}
      </main>
    </div>
  );
}

export default AddGiftPage;