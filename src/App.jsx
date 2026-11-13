import { Routes, Route } from "react-router-dom";
import Placeholder from "./pages/Placeholder.jsx";
import GuestWishlistPage from "./pages/guest/GuestWishlistPage.jsx";
import GiftDetailsPage from "./pages/guest/GiftDetailsPage.jsx";
import ReservationConfirmedPage from "./pages/guest/ReservationConfirmedPage.jsx";
import ManageReservationPage from "./pages/guest/ManageReservationPage.jsx";

// All app screens. Screen numbers (W1–W26) match the Figma file.
// When your page is ready, replace its <Placeholder /> with your component.
// W14, W14b and W19 are pop-ups (not pages), and W12b is a state inside W12, so they have no route.
function App() {
  return (
    <Routes>
      {/* 1 · Account */}
      <Route path="/signup" element={<Placeholder title="W1 · Sign up" />} />
      <Route path="/login" element={<Placeholder title="W2 · Log in" />} />
      <Route path="/forgot-password" element={<Placeholder title="W3 · Forgot password" />} />
      <Route path="/reset-password" element={<Placeholder title="W3b · Set new password" />} />

      {/* 2 · Registry Owner */}
      <Route path="/" element={<Placeholder title="W4 · Home" />} />
      <Route path="/my-wishlists/new" element={<Placeholder title="W5 · Create wishlist – Details" />} />
      <Route path="/my-wishlists/:registryId" element={<Placeholder title="W8 · Wishlist – owner view" />} />
      <Route path="/my-wishlists/:registryId/gifts/new" element={<Placeholder title="W6 / W7 · Add a gift" />} />
      <Route path="/my-wishlists/:registryId/gifts/:giftId/edit" element={<Placeholder title="W9 · Edit gift" />} />
      <Route path="/my-wishlists/:registryId/settings" element={<Placeholder title="W10 · Wishlist settings" />} />
      <Route path="/my-wishlists/:registryId/share" element={<Placeholder title="W11 · Share wishlist" />} />
      <Route path="/profile" element={<Placeholder title="W26 · Profile" />} />

      {/* 3 · Guest (no login) – the link matches getRegistryLink: /wishlist/:registryId */}
      <Route path="/wishlist/:registryId" element={<GuestWishlistPage />} />
      <Route path="/wishlist/:registryId/gift/:giftId" element={<GiftDetailsPage />} />
      <Route path="/wishlist/:registryId/reserved" element={<ReservationConfirmedPage />} />
          <Route path="/wishlist/:registryId/manage" element={<ManageReservationPage />} />
      <Route path="/wishlist/:registryId/gift/:giftId/group" element={<Placeholder title="W17 · Group gift" />} />
      <Route path="/wishlist/:registryId/gift/:giftId/notes" element={<Placeholder title="W18 · Group gift notes" />} />

      {/* 4 · Admin */}
      <Route path="/admin" element={<Placeholder title="W20 · Admin dashboard" />} />
      <Route path="/admin/users" element={<Placeholder title="W21 · Users – search" />} />
      <Route path="/admin/users/:userId" element={<Placeholder title="W22 · User details" />} />
      <Route path="/admin/reports" element={<Placeholder title="W23 · Reports" />} />
      <Route path="/admin/reports/:reportId" element={<Placeholder title="W23b · Report details" />} />
      <Route path="/admin/stores" element={<Placeholder title="W24 · Supported stores" />} />
      <Route path="/admin/occasion-types" element={<Placeholder title="W25 · Occasion types" />} />

      {/* Any link that doesn't match the routes above */}
      <Route path="*" element={<Placeholder title="Page not found" />} />
    </Routes>
  );
}

export default App;