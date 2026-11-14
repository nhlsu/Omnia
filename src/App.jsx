
import { Routes, Route, useNavigate } from "react-router-dom";
import Login from "./pages/Account/Login.jsx";
import SignUp from "./pages/Account/SignUp.jsx";
import ForgotPassword from "./pages/Account/ForgotPassword.jsx";
import ResetPassword from "./pages/Account/ResetPassword.jsx";
import Placeholder from "./pages/Placeholder.jsx";
import HomePage from "./pages/owner/HomePage.jsx";
import CreateWishlistPage from "./pages/owner/CreateWishlistPage.jsx";
import WishlistSettingsPage from "./pages/owner/WishlistSettingsPage.jsx";
import ShareWishlistPage from "./pages/owner/ShareWishlistPage.jsx";
import ProfilePage from "./pages/owner/ProfilePage.jsx";
import AddGiftPage from "./pages/owner/AddGiftPage.jsx";
import WishlistPage from "./pages/owner/WishlistPage.jsx";
import EditGiftPage from "./pages/owner/EditGiftPage.jsx";
import AdminPage from "./pages/admin/AdminPage";


// All app screens. Screen numbers (W1–W26) match the Figma file.
// When your page is ready, replace its <Placeholder /> with your component.
// W14, W14b and W19 are pop-ups (not pages), and W12b is a state inside W12, so they have no route.

function App() {
  const navigate = useNavigate();

  function handleAuthSuccess(user) {
    if (user.role === "admin") {
      navigate("/admin", { replace: true });
    } else {
      navigate("/", { replace: true });
    }
  }

  return (
    <Routes>

      {/* 1 · Account */}
      
      <Route path="/signup" element={ 
        <SignUp
      onRegistered={handleAuthSuccess}
      onLogin={() => navigate("/login")}
    />
  }
/>

      <Route path="/login" element={
        <Login
      onLoggedIn={handleAuthSuccess}
      onForgotPassword={() => navigate("/forgot-password")}
      onCreateAccount={() => navigate("/signup")}
    />
  }
/>

      <Route path="/forgot-password" element={
        <ForgotPassword
      onBack={() => navigate("/login")}
      onOpenReset={() => navigate("/reset-password")}
    />
  }
/>

      <Route path="/reset-password" element={
        <ResetPassword
      onBack={() => navigate("/forgot-password")}
      onLogin={() => navigate("/login")}
      onRequestNewLink={() => navigate("/forgot-password")}
    />
  }
/>


      {/* 2 · Registry Owner */}
      <Route path="/" element={<HomePage />} />
      <Route path="/my-wishlists/new" element={<CreateWishlistPage />} />
      <Route path="/my-wishlists/:registryId" element={<WishlistPage />} />
      <Route path="/my-wishlists/:registryId/gifts/new" element={<AddGiftPage />} />
      <Route path="/my-wishlists/:registryId/gifts/:giftId/edit" element={<EditGiftPage />} />
      <Route path="/my-wishlists/:registryId/settings" element={<WishlistSettingsPage />} />
      <Route path="/my-wishlists/:registryId/share" element={<ShareWishlistPage />} />
      <Route path="/profile" element={<ProfilePage />} />

      {/* 3 · Guest (no login) – the link matches getRegistryLink: /wishlist/:registryId */}
      <Route path="/wishlist/:registryId" element={<Placeholder title="W12 · Wishlist – guest view" />} />
      <Route path="/wishlist/:registryId/gift/:giftId" element={<Placeholder title="W13 · Gift details" />} />
      <Route path="/wishlist/:registryId/reserved" element={<Placeholder title="W15 · Reservation confirmed" />} />
      <Route path="/wishlist/:registryId/manage" element={<Placeholder title="W16 · Manage / cancel reservation" />} />
      <Route path="/wishlist/:registryId/gift/:giftId/group" element={<Placeholder title="W17 · Group gift" />} />
      <Route path="/wishlist/:registryId/gift/:giftId/notes" element={<Placeholder title="W18 · Group gift notes" />} />

      {/* 4 · Admin */}
      <Route path="/admin" element={<AdminPage />} />

      {/* Any link that doesn't match the routes above */}
      <Route path="*" element={<Placeholder title="Page not found" />} />
    </Routes>
  );
}

export default App;