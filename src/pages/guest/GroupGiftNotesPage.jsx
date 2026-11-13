import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  addNote,
  getGiftNotes,
  getGuestWishlist,
  getMyContributionId,
  GIFT_STATUS,
} from "../../AppContext.jsx";
import GuestHeader from "../../components/guest/GuestHeader.jsx";
import WishlistUnavailable from "../../components/guest/WishlistUnavailable.jsx";
import "./guest.css";
import "./GroupGiftNotesPage.css";

const NOTE_LIMIT = 300;

// "2026-10-04T08:00:00.000Z" -> "Just now" / "5m ago" / "2h ago" / "3d ago"
function timeAgo(isoDate) {
  const minutes = Math.floor((Date.now() - new Date(isoDate)) / 60000);
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;

  return `${Math.floor(hours / 24)}d ago`;
}

// W18 – Group gift notes (G7). Contributors coordinate here; the owner never sees this thread.
function GroupGiftNotesPage() {
  const { registryId, giftId } = useParams();
  const [text, setText] = useState("");
  const [error, setError] = useState("");

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
  const groupLink = `/wishlist/${registry.id}/gift/${gift.id}/group`;
  const isFullyFunded = gift.status === GIFT_STATUS.FULLY_FUNDED;

  // The guest's "ticket" for this gift (saved in W17 after pledging)
  const myContributionId = getMyContributionId(gift.id);

  // Only contributors can read the thread (G7). Without a ticket getGiftNotes throws.
  let notes = null;
  try {
    notes = getGiftNotes(gift.id, myContributionId);
  } catch {
    notes = null;
  }

  function handleSubmit(event) {
    event.preventDefault();

    try {
      addNote({ giftId: gift.id, contributionId: myContributionId, text });
      setText("");
      setError("");
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="guest-page">
      <main className="notes">
        <Link className="guest-back" to={groupLink}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="m15 18-6-6 6-6" />
          </svg>
          Group gift
        </Link>

        <div className="notes__heading">
          <h1 className="notes__title">Notes for contributors</h1>
          <p className="notes__text">
            Only people who pledged can read and post here. {ownerName || "The owner"} can’t see these notes.
          </p>
        </div>

        {notes === null ? (
          <div className="notes__locked">
            <p>Pledge to this gift first to read and post notes.</p>
            <Link className="guest-btn guest-btn--primary" to={groupLink}>
              Join this gift
            </Link>
          </div>
        ) : (
          <>
            <ul className="notes__list">
              {notes.length === 0 && (
                <li className="guest-hint">No notes yet. Start the conversation!</li>
              )}
              {notes.map((note) => (
                <li key={note.id} className="notes__item">
                  <div className="notes__meta">
                    <strong>{note.authorName}</strong>
                    <span>{timeAgo(note.createdAt)}</span>
                  </div>
                  <p>{note.text}</p>
                </li>
              ))}
            </ul>

            <form className="notes__form" onSubmit={handleSubmit} noValidate>
              <div className="guest-field">
                <label className="guest-label" htmlFor="note-text">Write a note</label>
                <textarea
                  id="note-text"
                  className={`guest-input notes__textarea ${error ? "guest-input--error" : ""}`}
                  value={text}
                  maxLength={NOTE_LIMIT}
                  rows={3}
                  placeholder="Should we pick the mint colour?"
                  onChange={(event) => setText(event.target.value)}
                />
                {error ? (
                  <p className="guest-error">{error}</p>
                ) : (
                  <p className="guest-hint">{text.length} / {NOTE_LIMIT}</p>
                )}
              </div>

              <button type="submit" className="guest-btn guest-btn--primary">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
                Post note
              </button>
            </form>
          </>
        )}

        {isFullyFunded && (
          <div className="notes__funded" role="status">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M20 6 9 17l-5-5" />
            </svg>
            <div>
              <strong>Fully funded</strong>
              <span>Pledges reached SAR {gift.price}. New pledges are closed.</span>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default GroupGiftNotesPage;