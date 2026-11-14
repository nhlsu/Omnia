import { useState } from "react";                                         
import { Link, useParams } from "react-router-dom";
import { getGuestWishlist, VISIBILITY } from "../../AppContext.jsx";      
import GuestHeader from "../../components/guest/GuestHeader.jsx";
import WishlistUnavailable from "../../components/guest/WishlistUnavailable.jsx";
import GiftCard from "../../components/guest/GiftCard.jsx";
import ReportModal from "../../components/guest/ReportModal.jsx";        
import "./guest.css";
import "./GuestWishlistPage.css";

// "2026-10-24" -> "24 October 2026" (empty if there's no date)
function formatDate(isoDate) {
  if (!isoDate) return "";
  return new Date(isoDate).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

// W12 – Wishlist, guest view (G1, G2, G3). Shows W12b when the wishlist can't be opened.
function GuestWishlistPage() {
  const { registryId } = useParams();
  const [isReportOpen, setIsReportOpen] = useState(false);               

  let wishlist;
  try {
    wishlist = getGuestWishlist(registryId);
  } catch {
    wishlist = null;
  }

  // W12b: stop here if the wishlist isn't available
  if (!wishlist) {
    return (
      <div className="guest-page">
        <GuestHeader />
        <WishlistUnavailable />
      </div>
    );
  }

  const { registry, occasionName, ownerName, gifts } = wishlist;

  // "Elham's birthday · 24 October 2026" (missing parts are skipped)
  const eventLabel = ownerName && occasionName
    ? `${ownerName}'s ${occasionName.toLowerCase()}`
    : occasionName;
  const subtitle = [eventLabel, formatDate(registry.date)].filter(Boolean).join(" · ");

  return (
    <div className="guest-page">
      <GuestHeader                                                       
        onReport={registry.visibility === VISIBILITY.PUBLIC ? () => setIsReportOpen(true) : undefined}
      />

      <main className="guest-wishlist">
        <h1 className="guest-wishlist__title">{registry.name}</h1>
        {subtitle && <p className="guest-wishlist__subtitle">{subtitle}</p>}

        {registry.note && (
          <section className="guest-wishlist__note">
            <h2 className="guest-wishlist__note-title">A note from {ownerName || "the host"}</h2>
            <p className="guest-wishlist__note-text">{registry.note}</p>
          </section>
        )}

        <div className="guest-wishlist__gifts">
          {gifts.length === 0 && (
            <p className="guest-wishlist__empty">No gifts have been added yet.</p>
          )}
          {gifts.map((gift) => (
            <GiftCard key={gift.id} gift={gift} registryId={registry.id} />
          ))}
        </div>

        <Link className="guest-wishlist__manage" to={`/wishlist/${registry.id}/manage`}>
          Manage my reservation
        </Link>
      </main>

      {isReportOpen && (                                                    
        <ReportModal registryId={registry.id} onClose={() => setIsReportOpen(false)} />
      )}
    </div>
  );
}

export default GuestWishlistPage;