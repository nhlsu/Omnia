import { useEffect, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { cancelReservation, findReservationByCode, getGuestWishlist } from "../../AppContext.jsx";
import StatusBadge from "../../components/guest/StatusBadge.jsx";
import "./guest.css";
import "./ManageReservationPage.css";

// Looks up the reservation once the full code is typed. Returns what the page should show.
function lookUp(code, registryId) {
  if (code.length < 6) return { reservation: null, error: "" };

  try {
    return { reservation: findReservationByCode(code, registryId), error: "" };
  } catch (error) {
    return { reservation: null, error: error.message };
  }
}

// W16 – Manage / cancel reservation (G5).
// The email's cancel link opens /wishlist/:registryId/manage?code=K7Q2MX, so the code is pre-filled.
function ManageReservationPage() {
  const { registryId } = useParams();
  const [searchParams] = useSearchParams();
  const [code, setCode] = useState((searchParams.get("code") || "").toUpperCase());
  const [toast, setToast] = useState("");

  // Hide the toast after 3 seconds
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(""), 3000);
    return () => clearTimeout(timer);
  }, [toast]);

  const { reservation, error } = lookUp(code, registryId);

  // Names for the card: "Scented candle" and "Reserved by Shahad · Birthday wishes"
  let giftName = "";
  let wishlistName = "";
  if (reservation) {
    try {
      const wishlist = getGuestWishlist(registryId);
      wishlistName = wishlist.registry.name;
      giftName = wishlist.gifts.find((gift) => gift.id === reservation.giftId)?.name || "";
    } catch {
      // The wishlist can't be shown any more; keep the names empty
    }
  }

  function handleCancel() {
    // G5: ask before removing the reservation
    const isSure = window.confirm("Cancel this reservation? Other guests will be able to reserve the gift again.");
    if (!isSure) return;

    cancelReservation(reservation.id);
    setCode("");
    setToast("Reservation cancelled");
  }

  return (
    <div className="guest-page">
      <main className="manage">
        <Link className="guest-back" to={`/wishlist/${registryId}`}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="m15 18-6-6 6-6" />
          </svg>
          Back
        </Link>

        <div className="manage__heading">
          <h1 className="manage__title">Manage my reservation</h1>
          <p className="manage__text">Open the cancel link from your email, or enter your code below.</p>
        </div>

        <div className="manage__field">
          <label className="manage__label" htmlFor="manage-code">Reservation code</label>
          <input
            id="manage-code"
            className={`manage__input ${error ? "manage__input--error" : ""}`}
            value={code}
            maxLength={6}
            autoComplete="off"
            placeholder="e.g. K7Q2MX"
            onChange={(event) => setCode(event.target.value.trim().toUpperCase())}
          />
          {error && <p className="manage__error">{error}</p>}
        </div>

        {reservation && (
          <>
            <div className="manage__card">
              <div className="manage__card-icon" aria-hidden="true">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="8" width="18" height="4" rx="1" />
                  <path d="M12 8v13M19 12v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7" />
                  <path d="M7.5 8a2.5 2.5 0 0 1 0-5C10 3 12 8 12 8s2-5 4.5-5a2.5 2.5 0 0 1 0 5" />
                </svg>
              </div>
              <div className="manage__card-body">
                <strong>{giftName}</strong>
                <span>
                  Reserved by {reservation.displayName}
                  {wishlistName && ` · ${wishlistName}`}
                </span>
              </div>
              <StatusBadge status="reserved" />
            </div>

            <button type="button" className="guest-btn guest-btn--danger" onClick={handleCancel}>
              Cancel reservation
            </button>
          </>
        )}
      </main>

      {toast && (
        <div className="toast" role="status">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M20 6 9 17l-5-5" />
          </svg>
          {toast}
        </div>
      )}
    </div>
  );
}

export default ManageReservationPage;