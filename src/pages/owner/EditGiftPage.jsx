import { useState } from "react";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import {
  getCurrentUser,
  getRegistryWithGifts,
  removeGift,
  updateGift,
} from "../../AppContext.jsx";
import BackHeader from "../../components/owner/BackHeader.jsx";
import GiftForm from "../../components/owner/GiftForm.jsx";
import { AlertIcon, TrashIcon } from "../../components/owner/icons.jsx";
import "./owner.css";
import "./AddGiftPage.css";
import "./EditGiftPage.css";

// The list's gifts (with their summaries), or null if the list is missing or not the owner's.
function loadGifts(registryId) {
  try {
    return getRegistryWithGifts(registryId).gifts;
  } catch {
    return null;
  }
}

// W9 Edit gift, with the W9b "Remove this gift?" pop-up.
function EditGiftPage() {
  const navigate = useNavigate();
  const { registryId, giftId } = useParams();
  const [showRemove, setShowRemove] = useState(false);

  const gifts = loadGifts(registryId);
  const gift = gifts?.find((item) => item.id === giftId);

  if (!getCurrentUser()) {
    return <Navigate to="/login" replace />;
  }
  if (!gift) {
    return <Navigate to={`/my-wishlists/${registryId}`} replace />;
  }

  const minQuantity = Math.max(1, gift.reservedUnits);

  // Who would lose something if the gift is removed (W9b sentence).
  const guestCount = gift.reservedBy.length + gift.contributorCount;

  function handleSave(values) {
    updateGift(giftId, values);
    navigate(`/my-wishlists/${registryId}`);
  }

  function handleRemove() {
    removeGift(giftId);
    navigate(`/my-wishlists/${registryId}`);
  }

  const removeMessage =
    guestCount > 0
      ? `${guestCount} ${guestCount === 1 ? "guest has" : "guests have"} already reserved “${gift.name}”. Removing it cancels their reservation.`
      : "This can't be undone.";

  return (
    <div className="owner-page">
      <BackHeader to={`/my-wishlists/${registryId}`} />

      <main className="owner-content">
        <h1 className="gift__title">Edit gift</h1>

        <GiftForm
          variant="edit"
          initial={gift}
          minQuantity={minQuantity}
          submitLabel="Save changes"
          onSubmit={handleSave}
          quantityNote={
            gift.reservedUnits > 0 ? (
              <div className="gift-banner gift-banner--warning" role="status">
                <AlertIcon size={18} />
                <p>
                  {gift.reservedUnits} of {gift.quantity} already reserved, so
                  the quantity can't go below {gift.reservedUnits}.
                </p>
              </div>
            ) : null
          }
          footer={
            <button
              type="button"
              className="edit__remove"
              onClick={() => setShowRemove(true)}
            >
              <TrashIcon size={18} />
              Remove gift
            </button>
          }
        />
      </main>

      {/* W9b: confirmation pop-up */}
      {showRemove && (
        <div
          className="modal"
          role="dialog"
          aria-modal="true"
          aria-labelledby="remove-title"
        >
          <div className="modal__card">
            <div className="modal__icon">
              <TrashIcon size={28} />
            </div>
            <h2 id="remove-title" className="modal__title">
              Remove this gift?
            </h2>

            <p className="modal__text">{removeMessage}</p>

            <button
              type="button"
              className="modal__danger"
              onClick={handleRemove}
            >
              Remove gift
            </button>
            <button
              type="button"
              className="modal__cancel"
              onClick={() => setShowRemove(false)}
            >
              Keep gift
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default EditGiftPage;