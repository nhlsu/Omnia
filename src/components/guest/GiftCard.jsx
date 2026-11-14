import { Link } from "react-router-dom";
import { GIFT_STATUS } from "../../AppContext.jsx";
import StatusBadge from "./StatusBadge.jsx";
import "./GiftCard.css";


// One gift in the guest wishlist (W12).
// `gift` comes from getGuestWishlist, so it already has status, quantity, reservedUnits and pledged.
function GiftCard({ gift, registryId }) {
  const giftLink = `/wishlist/${registryId}/gift/${gift.id}`;

  const isGroupGift =
    gift.status === GIFT_STATUS.GROUP_IN_PROGRESS || gift.status === GIFT_STATUS.FULLY_FUNDED;

  // How full the progress bar is (never more than 100%)
  const percent = isGroupGift ? Math.min(100, (gift.pledged / gift.price) * 100) : 0;

  // The link on the right: "Join" for an open group gift, none when fully reserved, "View" otherwise
  let action = null;
  if (gift.status === GIFT_STATUS.GROUP_IN_PROGRESS) {
    action = { label: "Join", to: `${giftLink}/group` };
  } else if (gift.status !== GIFT_STATUS.RESERVED) {
    action = { label: "View", to: giftLink };
  }

  return (
    <article className="gift-card">
      <div className="gift-card__image">
        {gift.imageUrl ? (
          <img src={gift.imageUrl} alt="" />
        ) : (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <circle cx="9" cy="9" r="2" />
            <path d="m21 15-3.1-3.1a2 2 0 0 0-2.8 0L6 21" />
          </svg>
        )}
      </div>

      <div className="gift-card__body">
        <h2 className="gift-card__name">{gift.name}</h2>
        {gift.price > 0 && <p className="gift-card__price">SAR {gift.price}</p>}

        {gift.status === GIFT_STATUS.PARTLY_RESERVED && (
          <p className="gift-card__meta">
            {gift.reservedUnits} of {gift.quantity} reserved
          </p>
        )}

        {gift.status === GIFT_STATUS.RESERVED && (
          <p className="gift-card__meta">Already reserved by a guest</p>
        )}

        {isGroupGift && (
          <>
            <p className="gift-card__pledged">
              SAR {gift.pledged} of {gift.price} pledged
            </p>
            <div className="gift-card__progress">
              <div className="gift-card__progress-fill" style={{ width: `${percent}%` }} />
            </div>
          </>
        )}

        <div className="gift-card__footer">
          <StatusBadge status={gift.status} />
          {action && (
            <Link className="gift-card__action" to={action.to}>
              {action.label}
            </Link>
          )}
        </div>
      </div>
    </article>
  );
}

export default GiftCard;