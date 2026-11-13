import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  addContribution,
  getGiftContributors,
  getGuestWishlist,
  getMyContributionId,
  rememberMyContribution,
  GIFT_STATUS,
} from "../../AppContext.jsx";
import GuestHeader from "../../components/guest/GuestHeader.jsx";
import WishlistUnavailable from "../../components/guest/WishlistUnavailable.jsx";
import StatusBadge from "../../components/guest/StatusBadge.jsx";
import "./guest.css";
import "./GroupGiftPage.css";

// W17 – Group gift (G6, G8). Guests pledge part of the price; Omnia records pledges only.
function GroupGiftPage() {
  const { registryId, giftId } = useParams();

  // The "Join this gift" form
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState("");

  let wishlist = null;
  try {
    wishlist = getGuestWishlist(registryId);
  } catch {
    wishlist = null;
  }

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
  const ownerLabel = ownerName || "the owner";
  const contributors = getGiftContributors(gift.id);
  const myContributionId = getMyContributionId(gift.id);

  const isFullyFunded = gift.status === GIFT_STATUS.FULLY_FUNDED;
  const canPledge = !isFullyFunded && gift.price > 0 && gift.reservedUnits === 0;
  const remaining = gift.remaining;
  const minimum = Math.min(50, remaining);
  const percent = gift.price > 0 ? Math.min(100, (gift.pledged / gift.price) * 100) : 0;

  function handleSubmit(event) {
    event.preventDefault();
    const value = Number(amount);

    // STEP 1: check the fields first so each error shows under its field
    const newErrors = {};
    if (!name.trim()) newErrors.name = "Please enter your name.";
    if (!Number.isFinite(value) || value < minimum || value > remaining) {
      newErrors.amount = `Enter an amount from SAR ${minimum} to SAR ${remaining}.`;
    }
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    // STEP 2: save the pledge, then keep its id as this guest's "ticket" for the notes
    try {
      const contribution = addContribution({
        giftId: gift.id,
        displayName: name,
        amount: value,
        isAnonymous,
      });
      rememberMyContribution(gift.id, contribution.id);
      setName("");
      setAmount("");
      setIsAnonymous(false);
      setSuccess(`Thanks! Your pledge of SAR ${value} was recorded.`);
    } catch (error) {
      setErrors({ form: error.message });
    }
  }

  return (
    <div className="guest-page">
      <main className="group">
        <Link className="guest-back" to={`/wishlist/${registry.id}/gift/${gift.id}`}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="m15 18-6-6 6-6" />
          </svg>
          Gift details
        </Link>

        <h1 className="group__title">Group gift</h1>

        <div className="group__gift">
          <div className="group__gift-icon" aria-hidden="true">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="8" width="18" height="4" rx="1" />
              <path d="M12 8v13M19 12v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7" />
              <path d="M7.5 8a2.5 2.5 0 0 1 0-5C10 3 12 8 12 8s2-5 4.5-5a2.5 2.5 0 0 1 0 5" />
            </svg>
          </div>
          <div className="group__gift-body">
            <strong>{gift.name}</strong>
            <span>SAR {gift.price} · {registry.name}</span>
          </div>
          <StatusBadge status={gift.status} />
        </div>

        <div className="group__progress">
          <div className="group__progress-labels">
            <span>SAR {gift.pledged} of {gift.price} pledged</span>
            <span className="group__left">SAR {remaining} left</span>
          </div>
          <div className="group__bar">
            <div className="group__bar-fill" style={{ width: `${percent}%` }} />
          </div>
        </div>

        {contributors.length > 0 && (
          <section className="group__section">
            <h2 className="group__heading">Contributors</h2>
            <ul className="group__list">
              {contributors.map((person, index) => (
                <li key={index} className="group__person">
                  <span className="group__avatar" aria-hidden="true">
                    {person.displayName.charAt(0).toUpperCase()}
                  </span>
                  <div className="group__person-body">
                    <strong>
                      {person.displayName}
                      {person.isAnonymous && ` (hidden from ${ownerLabel})`}
                    </strong>
                    <span>SAR {person.amount}</span>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        )}

        {success && <p className="group__success" role="status">{success}</p>}

        {myContributionId && (
          <Link className="guest-btn guest-btn--outline" to={`/wishlist/${registry.id}/gift/${gift.id}/notes`}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
            Notes for contributors
          </Link>
        )}

        {isFullyFunded && (
          <div className="group__funded" role="status">
            <strong>Fully funded</strong>
            <span>Pledges reached SAR {gift.price}. New pledges are closed.</span>
          </div>
        )}

        {!isFullyFunded && !canPledge && (
          <p className="guest-hint">This gift can’t be shared as a group gift.</p>
        )}

        {canPledge && (
          <form className="group__form" onSubmit={handleSubmit} noValidate>
            <h2 className="group__heading">Join this gift</h2>

            {errors.form && <p className="guest-alert" role="alert">{errors.form}</p>}

            <div className="guest-field">
              <label className="guest-label" htmlFor="pledge-name">Your name *</label>
              <input
                id="pledge-name"
                className={`guest-input ${errors.name ? "guest-input--error" : ""}`}
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Your name"
              />
              {errors.name && <p className="guest-error">{errors.name}</p>}
            </div>

            <div className="guest-field">
              <label className="guest-label" htmlFor="pledge-amount">Amount (SAR) *</label>
              <input
                id="pledge-amount"
                type="number"
                inputMode="decimal"
                min={minimum}
                max={remaining}
                className={`guest-input ${errors.amount ? "guest-input--error" : ""}`}
                value={amount}
                onChange={(event) => setAmount(event.target.value)}
                placeholder={String(minimum)}
              />
              {errors.amount ? (
                <p className="guest-error">{errors.amount}</p>
              ) : (
                <p className="guest-hint">
                  Minimum SAR {minimum}, up to SAR {remaining} (what’s left).
                </p>
              )}
            </div>

            <label className="guest-check">
              <input
                type="checkbox"
                checked={isAnonymous}
                onChange={(event) => setIsAnonymous(event.target.checked)}
              />
              Hide my name from {ownerLabel}
            </label>

            <button type="submit" className="guest-btn guest-btn--primary">
              {Number(amount) > 0 ? `Pledge SAR ${amount}` : "Pledge"}
            </button>
          </form>
        )}

        <p className="group__info">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <circle cx="12" cy="12" r="10" />
            <path d="M12 16v-4M12 8h.01" />
          </svg>
          Omnia records pledges only. Contributors arrange the purchase together using the notes.
        </p>
      </main>
    </div>
  );
}

export default GroupGiftPage;