import { useState } from "react";
import ReserveSheet from "../../components/guest/ReserveSheet.jsx";
import ReportModal from "../../components/guest/ReportModal.jsx";
import { Link, useParams } from "react-router-dom";
import { getGuestWishlist, GIFT_STATUS, VISIBILITY } from "../../AppContext.jsx";
import GuestHeader from "../../components/guest/GuestHeader.jsx";
import WishlistUnavailable from "../../components/guest/WishlistUnavailable.jsx";
import StatusBadge from "../../components/guest/StatusBadge.jsx";
import "./guest.css";
import "./GiftDetailsPage.css";

// W13 – Gift details (G2, G3). Opened from "View" on a gift card.
function GiftDetailsPage() {
  const { registryId, giftId } = useParams();

// Is the reserve sheet (W14) open?
  const [isReserveOpen, setIsReserveOpen] = useState(false);

  // Changing this number makes the page read the gift again (after a conflict)
  const [, setDataVersion] = useState(0);
  const [isReportOpen, setIsReportOpen] = useState(false);


  let wishlist = null;
  try {
    wishlist = getGuestWishlist(registryId);
  } catch {
    wishlist = null;
  }

  // The gift must be in THIS wishlist
  const gift = wishlist ? wishlist.gifts.find((item) => item.id === giftId) : null;

  if (!gift) {
    return (
      <div className="guest-page">
        <GuestHeader />
        <WishlistUnavailable />
      </div>
    );
  }

  const { registry, ownerName } = wishlist;
  const availableUnits = gift.quantity - gift.reservedUnits;
  const hasPrice = gift.price > 0;
  const isGroupGift =
    gift.status === GIFT_STATUS.GROUP_IN_PROGRESS || gift.status === GIFT_STATUS.FULLY_FUNDED;

  // ① Reserve: only while units are left and it isn't a group gift
  const canReserve = availableUnits > 0 && !isGroupGift;

  // ② Group gift: needs a price and no normal reservations
  const canUseGroupGift = hasPrice && gift.reservedUnits === 0;
  let groupLabel = "Start a group gift";
  if (gift.status === GIFT_STATUS.GROUP_IN_PROGRESS) groupLabel = "Join group gift";
  if (gift.status === GIFT_STATUS.FULLY_FUNDED) groupLabel = "View group gift";

  // ③ Report: public wishlists only
  const isPublic = registry.visibility === VISIBILITY.PUBLIC;

  return (
    <div className="guest-page">
      <main className="gift-details">
        <Link className="guest-back" to={`/wishlist/${registry.id}`}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="m15 18-6-6 6-6" />
          </svg>
          {registry.name}
        </Link>

        <div className="gift-details__image">
          {gift.imageUrl ? (
            <img src={gift.imageUrl} alt={gift.name} />
          ) : (
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <circle cx="9" cy="9" r="2" />
              <path d="m21 15-3.1-3.1a2 2 0 0 0-2.8 0L6 21" />
            </svg>
          )}
        </div>

        <h1 className="gift-details__name">{gift.name}</h1>

        <dl className="gift-details__info">
          {hasPrice && (
            <div className="gift-details__row">
              <dt>Price</dt>
              <dd>SAR {gift.price}</dd>
            </div>
          )}
          <div className="gift-details__row">
            <dt>Status</dt>
            <dd><StatusBadge status={gift.status} /></dd>
          </div>
          <div className="gift-details__row">
            <dt>Quantity</dt>
            <dd>{availableUnits} of {gift.quantity} available</dd>
          </div>
        </dl>

        {gift.notes && (
          <section className="gift-details__note">
            <h2>Note from {ownerName || "the host"}</h2>
            <p>{gift.notes}</p>
          </section>
        )}

        <div className="gift-details__actions">
          {gift.productUrl && (
            <a className="guest-btn guest-btn--outline" href={gift.productUrl} target="_blank" rel="noopener noreferrer">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
              </svg>
              Buy from store
            </a>
          )}

          <button type="button" className="guest-btn guest-btn--primary" disabled={!canReserve} onClick={() => setIsReserveOpen(true)}>
            Reserve this gift
          </button>

          {canUseGroupGift && (
            <Link className="guest-btn guest-btn--outline" to={`/wishlist/${registry.id}/gift/${gift.id}/group`}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
              {groupLabel}
            </Link>
          )}

          {isPublic && (
            <button type="button" className="guest-link" onClick={() => setIsReportOpen(true)}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
                <line x1="4" x2="4" y1="22" y2="15" />
              </svg>
              Report this gift
            </button>
          )}
        </div>
      </main>
      {isReserveOpen && (
        <ReserveSheet
          gift={gift}
          registryId={registry.id}
          ownerName={ownerName}
          availableUnits={availableUnits}
          onClose={() => setIsReserveOpen(false)}
          onConflict={() => setDataVersion((version) => version + 1)}
        />
      )}

      {isReportOpen && (
        <ReportModal registryId={registry.id} giftId={gift.id} onClose={() => setIsReportOpen(false)} />
      )}


    </div>
  );
  
}

export default GiftDetailsPage;