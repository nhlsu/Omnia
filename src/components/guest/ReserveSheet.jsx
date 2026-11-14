import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { reserveGift } from "../../AppContext.jsx";
import "./ReserveSheet.css";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// W14 + W14b – bottom sheet for reserving a gift (G4, G8).
// Opens over W13. On success it goes to W15 with the reservation code.
function ReserveSheet({ gift, registryId, ownerName, availableUnits, onClose, onConflict }) {
  const navigate = useNavigate();

  // What the guest types. React keeps these values and redraws when they change.
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [units, setUnits] = useState(1);
  const [isAnonymous, setIsAnonymous] = useState(false);

  // Error messages: one per field, plus the red banner when someone else was faster
  const [errors, setErrors] = useState({});
  const [conflict, setConflict] = useState("");

  // Close with the Escape key (keyboard users, NFR12)
  useEffect(() => {
    function handleKey(event) {
      if (event.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onClose]);

  function handleSubmit(event) {
    event.preventDefault(); // stop the browser from reloading the page

    // STEP 1: check both fields first, so the guest sees every error at once (W14b)
    const newErrors = {};
    if (!name.trim()) newErrors.name = "Please enter your name.";
    if (!EMAIL_PATTERN.test(email.trim())) newErrors.email = "Enter a valid email address.";
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    // STEP 2: reserve. reserveGift re-checks availability at this exact moment (G4)
    try {
      const reservation = reserveGift({
        giftId: gift.id,
        displayName: name,
        email,
        units,
        isAnonymous,
      });

      // Go to W15 and carry the details it needs to show
      navigate(`/wishlist/${registryId}/reserved`, {
        state: {
          code: reservation.code,
          email: reservation.email,
          giftName: gift.name,
          productUrl: gift.productUrl,
        },
      });
    } catch (error) {
      setConflict(error.message);
      onConflict(); // the page reloads the gift so its status is up to date
    }
  }

  return (
    <div className="sheet-overlay" onClick={onClose}>
      <form
        className="sheet"
        role="dialog"
        aria-modal="true"
        aria-labelledby="reserve-title"
        onClick={(event) => event.stopPropagation()}
        onSubmit={handleSubmit}
        noValidate
      >
        <div className="sheet__handle" aria-hidden="true" />
        <h2 id="reserve-title" className="sheet__title">Reserve “{gift.name}”</h2>

        {conflict && (
          <div className="sheet__alert" role="alert">
            <strong>{conflict}</strong>
            <span>The list has been refreshed. Please choose another gift.</span>
          </div>
        )}

        <label className="sheet__label" htmlFor="reserve-name">Your name *</label>
        <input
          id="reserve-name"
          className={`sheet__input ${errors.name ? "sheet__input--error" : ""}`}
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="Your name"
        />
        {errors.name && <p className="sheet__error">{errors.name}</p>}

        <label className="sheet__label" htmlFor="reserve-email">Email *</label>
        <input
          id="reserve-email"
          type="email"
          className={`sheet__input ${errors.email ? "sheet__input--error" : ""}`}
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="you@example.com"
        />
        {errors.email ? (
          <p className="sheet__error">{errors.email}</p>
        ) : (
          <p className="sheet__hint">
            We’ll email your reservation code and cancel link. The owner never sees your email.
          </p>
        )}

        {availableUnits > 1 && (
          <>
            <label className="sheet__label" htmlFor="reserve-units">How many?</label>
            <select
              id="reserve-units"
              className="sheet__input"
              value={units}
              onChange={(event) => setUnits(Number(event.target.value))}
            >
              {Array.from({ length: availableUnits }, (_, index) => index + 1).map((count) => (
                <option key={count} value={count}>{count}</option>
              ))}
            </select>
          </>
        )}

        <label className="sheet__check">
          <input
            type="checkbox"
            checked={isAnonymous}
            onChange={(event) => setIsAnonymous(event.target.checked)}
          />
          Hide my name from {ownerName || "the owner"}
        </label>

        <button type="submit" className="guest-btn guest-btn--primary" disabled={Boolean(conflict)}>
          Confirm reservation
        </button>
      </form>
    </div>
  );
}

export default ReserveSheet;