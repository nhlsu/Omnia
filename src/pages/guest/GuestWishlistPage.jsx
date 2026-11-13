import { useParams } from "react-router-dom";
import { getGuestWishlist } from "../../AppContext.jsx";
import GuestHeader from "../../components/guest/GuestHeader.jsx";
import WishlistUnavailable from "../../components/guest/WishlistUnavailable.jsx";
import "./GuestWishlistPage.css";

// W12 – Wishlist, guest view (G1, G3). Shows W12b when the wishlist can't be opened.
function GuestWishlistPage() {
  // The id comes from the link: /wishlist/:registryId
  const { registryId } = useParams();

  // getGuestWishlist throws if the list is private, hidden, a draft or missing
  let wishlist = null;
  try {
    wishlist = getGuestWishlist(registryId);
  } catch {
    wishlist = null;
  }

  return (
    <div className="guest-page">
      <GuestHeader />

      {wishlist ? (
        <p className="guest-page__temp">{wishlist.registry.name}</p>
      ) : (
        <WishlistUnavailable />
      )}
    </div>
  );
}

export default GuestWishlistPage;