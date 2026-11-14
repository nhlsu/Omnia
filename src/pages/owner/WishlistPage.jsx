import { Link, Navigate, useParams } from "react-router-dom";
import {
  getCurrentUser,
  getRegistryWithGifts,
  GIFT_STATUS,
  REGISTRY_STATUS,
  VISIBILITY,
} from "../../AppContext.jsx";
import BackHeader from "../../components/owner/BackHeader.jsx";
import BottomNav from "../../components/owner/BottomNav.jsx";
import { ImageIcon, ShareIcon, SlidersIcon } from "../../components/owner/icons.jsx";
import "./owner.css";
import "./WishlistPage.css";

const VISIBILITY_LABELS = {
  [VISIBILITY.PUBLIC]: "Public",
  [VISIBILITY.LINK_ONLY]: "Link only",
  [VISIBILITY.PRIVATE]: "Private",
};

// Badge text and colour for each gift status (Figma W8).
const STATUS_BADGES = {
  [GIFT_STATUS.AVAILABLE]: {
    label: "Available",
    className: "badge badge--available",
  },
  [GIFT_STATUS.PARTLY_RESERVED]: {
    label: "Partly reserved",
    className: "badge badge--partly",
  },
  [GIFT_STATUS.RESERVED]: {
    label: "Reserved",
    className: "badge badge--reserved",
  },
  [GIFT_STATUS.GROUP_IN_PROGRESS]: {
    label: "Group gift in progress",
    className: "badge badge--group",
  },
  [GIFT_STATUS.FULLY_FUNDED]: {
    label: "Fully funded",
    className: "badge badge--available",
  },
};

// Everything W8 needs, or null if the list is missing or not the owner's.
function loadWishlist(registryId) {
  try {
    return getRegistryWithGifts(registryId);
  } catch {
    return null;
  }
}

// Grey line under a gift's price (W8).
function giftDetail(gift) {
  if (gift.contributorCount > 0) {
    const contributorLabel =
      gift.contributorCount === 1 ? "contributor" : "contributors";
    return `Group gift · ${gift.contributorCount} ${contributorLabel}`;
  }

  if (!gift.reservedBy?.length) {
    return "";
  }

  const names = gift.reservedBy.join(", ");
  if (gift.status === GIFT_STATUS.PARTLY_RESERVED) {
    return `Reserved by ${names} · ${gift.reservedUnits} of ${gift.quantity} reserved`;
  }

  return `Reserved by ${names}`;
}

// W8 Wishlist – owner view.
function WishlistPage() {
  const { registryId } = useParams();
  const user = getCurrentUser();
  const data = loadWishlist(registryId);

  if (!user) {
    return <Navigate to="/login" replace />;
  }
  if (!data) {
    return <Navigate to="/" replace />;
  }

  const { registry, occasionName, gifts, totalUnits, reservedUnits, percent } = data;

  const date = registry.date
    ? new Date(registry.date).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "";
  const giftCount = `${gifts.length} ${gifts.length === 1 ? "gift" : "gifts"}`;
  const visibilityLabel =
    registry.status === REGISTRY_STATUS.DRAFT
      ? "Draft"
      : VISIBILITY_LABELS[registry.visibility];
  const meta = [occasionName, date, giftCount, visibilityLabel]
    .filter(Boolean)
    .join(" · ");

  return (
    <div className="owner-page">
      <BackHeader
        to="/"
        label="My lists"
        right={
          <Link
            to={`/my-wishlists/${registryId}/settings`}
            className="wishlist__settings"
          >
            Settings
            <SlidersIcon size={18} />
          </Link>
        }
      />

      <main className="owner-content">
        <h1 className="wishlist__title">{registry.name}</h1>
        <p className="wishlist__meta">{meta}</p>

        {registry.note && (
          <div className="wishlist-note">
            <p className="wishlist-note__title">
              A note from {user.name.split(" ")[0]}
            </p>
            <p>{registry.note}</p>
          </div>
        )}

        <div className="wishlist-progress">
          <div className="wishlist-progress__labels">
            <span>
              {reservedUnits} of {totalUnits} gifts reserved
            </span>
            <span className="wishlist-progress__percent">{percent}%</span>
          </div>
          <div className="progress">
            <div
              className="progress__fill"
              style={{ width: `${percent}%` }}
            />
          </div>
        </div>

        {gifts.length === 0 && (
          <p className="wishlist__empty">No gifts yet. Add the first one below.</p>
        )}

        <div className="wishlist-gifts">
          {gifts.map((gift) => {
            const badge = STATUS_BADGES[gift.status];
            const detail = giftDetail(gift);
            const pledgePercent =
              gift.contributorCount > 0 && gift.price
                ? Math.min(100, (gift.pledged / gift.price) * 100)
                : 0;

            return (
              <div key={gift.id} className="gift-card">
                <div className="gift-card__image">
                  {gift.imageUrl ? (
                    <img src={gift.imageUrl} alt="" />
                  ) : (
                    <ImageIcon size={24} />
                  )}
                </div>
                <div className="gift-card__body">
                  <p className="gift-card__name">{gift.name}</p>
                  {gift.price !== null && (
                    <p className="gift-card__price">SAR {gift.price}</p>
                  )}
                  {detail && <p className="gift-card__detail">{detail}</p>}

                  {gift.contributorCount > 0 && (
                    <>
                      <p className="gift-card__pledged">
                        SAR {gift.pledged} of {gift.price} pledged
                      </p>
                      <div className="progress">
                        <div
                          className="progress__fill"
                          style={{ width: `${pledgePercent}%` }}
                        />
                      </div>
                    </>
                  )}

                  <div className="gift-card__footer">
                    <span className={badge.className}>{badge.label}</span>
                    <Link
                      to={`/my-wishlists/${registryId}/gifts/${gift.id}/edit`}
                      className="gift-card__edit"
                    >
                      Edit
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="wishlist-actions">
          <Link
            to={`/my-wishlists/${registryId}/gifts/new`}
            className="wishlist-actions__add"
          >
            + Add gift
          </Link>
          <Link
            to={`/my-wishlists/${registryId}/share`}
            className="wishlist-actions__share"
          >
            <ShareIcon size={18} />
            Share
          </Link>
        </div>
      </main>

      <BottomNav />
    </div>
  );
}

export default WishlistPage;