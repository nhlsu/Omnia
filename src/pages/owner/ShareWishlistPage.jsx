import { useState } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import {
  getCurrentUser,
  getRegistryLink,
  getRegistryWithGifts,
  REGISTRY_STATUS,
  updateRegistry,
  VISIBILITY,
} from "../../AppContext.jsx";
import BackHeader from "../../components/owner/BackHeader.jsx";
import {
  AlertIcon,
  CheckIcon,
  CopyIcon,
  GiftIcon,
  LinkIcon,
  ShareIcon,
} from "../../components/owner/icons.jsx";
import "./owner.css";
import "./ShareWishlistPage.css";

const VISIBILITY_LABELS = {
  [VISIBILITY.PUBLIC]: "Public",
  [VISIBILITY.LINK_ONLY]: "Link only",
  [VISIBILITY.PRIVATE]: "Private",
};

// Loads the list, its gifts and its share link. Returns null if the list is
// missing or not the owner's (the AppContext functions throw in those cases).
function loadShareData(registryId) {
  try {
    const data = getRegistryWithGifts(registryId);

    // Publish a draft when the owner reaches the final sharing step.
    if (data.registry.status === REGISTRY_STATUS.DRAFT) {
      updateRegistry(registryId, { status: REGISTRY_STATUS.PUBLISHED });
    }

    return { ...data, link: getRegistryLink(registryId) };
  } catch {
    return null;
  }
}

// W11 Share wishlist – step 3 of 3.
function ShareWishlistPage() {
  const { registryId } = useParams();
  const [copied, setCopied] = useState(false);

  const data = loadShareData(registryId);

  if (!getCurrentUser()) {
    return <Navigate to="/login" replace />;
  }
  if (!data) {
    return <Navigate to="/" replace />;
  }

  const { registry, gifts, link } = data;

  const displayLink = link.replace(/^https?:\/\//, "");

  const giftCount = `${gifts.length} ${gifts.length === 1 ? "gift" : "gifts"}`;
  const date = registry.date
    ? new Date(registry.date).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "";
  const summary = date ? `${giftCount} · ${date}` : giftCount;

  async function handleCopy() {
    await navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function handleShare() {
    if (navigator.share) {
      await navigator.share({ title: registry.name, url: link });
    } else {
      await handleCopy();
    }
  }

  return (
    <div className="owner-page">
      <BackHeader
        to={`/my-wishlists/${registryId}`}
        right={<span>3 of 3 · Share</span>}
      />

      {/* 3-step progress bar: all three steps done */}
      <div className="steps" aria-hidden="true">
        <span className="steps__bar steps__bar--done" />
        <span className="steps__bar steps__bar--done" />
        <span className="steps__bar steps__bar--done" />
      </div>

      <main className="owner-content">
        <div className="share__check">
          <CheckIcon size={32} />
        </div>

        <h1 className="share__title">Share the joy</h1>
        <p className="share__subtitle">Your wishlist is ready for your guests.</p>

        <div className="share-card">
          <div className="share-card__icon">
            <GiftIcon size={20} />
          </div>
          <div className="share-card__info">
            <p className="share-card__name">{registry.name}</p>
            <p className="share-card__meta">{summary}</p>
          </div>
          <span className="share-card__badge">
            {VISIBILITY_LABELS[registry.visibility]}
          </span>
        </div>

        <div className="share-link">
          <LinkIcon size={20} />
          <span className="share-link__text">{displayLink}</span>
          <button
            type="button"
            className="share-link__copy"
            onClick={handleCopy}
            aria-label="Copy link"
          >
            <CopyIcon size={20} />
          </button>
        </div>

        <button type="button" className="share__button" onClick={handleCopy}>
          <CopyIcon size={18} />
          Copy link
        </button>

        <button
          type="button"
          className="share__button share__button--outline"
          onClick={handleShare}
        >
          <ShareIcon size={18} />
          Share with guests
        </button>

        {registry.visibility === VISIBILITY.PRIVATE && (
          <div className="share__warning" role="status">
            <AlertIcon size={18} />
            <div>
              <p className="share__warning-title">This wishlist is Private</p>
              <p>Guests can't open this link. Change visibility to share it.</p>
            </div>
          </div>
        )}

        <Link to={`/my-wishlists/${registryId}`} className="share__back">
          Back to my wishlist
        </Link>
      </main>

      {copied && (
        <p className="share__toast" role="status">
          <CheckIcon size={16} />
          Link copied
        </p>
      )}
    </div>
  );
}

export default ShareWishlistPage;