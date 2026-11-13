import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import {
  createRegistry,
  getActiveOccasionTypes,
  getCurrentUser,
  NOTE_MAX_LENGTH,
} from "../../AppContext.jsx";
import BackHeader from "../../components/owner/BackHeader.jsx";
import "./owner.css";
import "./CreateWishlistPage.css";

// W5 Create wishlist – step 1 of 3 (Details).
function CreateWishlistPage() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    occasionTypeId: "",
    date: "",
    note: "",
  });
  const [error, setError] = useState("");

  // Owner screens need a logged-in user. Logged out → go to the login page.
  if (!getCurrentUser()) {
    return <Navigate to="/login" replace />;
  }

  const occasionTypes = getActiveOccasionTypes();

  function handleChange(event) {
    const { name, value } = event.target;
    setForm({ ...form, [name]: value });
  }

  function handleSubmit(event) {
    event.preventDefault();

    try {
      const registry = createRegistry(form);
      navigate(`/my-wishlists/${registry.id}/gifts/new`);
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="owner-page">
      <BackHeader to="/" right={<span>1 of 3 · Details</span>} />

      {/* 3-step progress bar: step 1 of 3 is filled */}
      <div className="steps" aria-hidden="true">
        <span className="steps__bar steps__bar--done" />
        <span className="steps__bar" />
        <span className="steps__bar" />
      </div>

      <form className="owner-content" onSubmit={handleSubmit} noValidate>
        <h1 className="create__title">Create a wishlist</h1>
        <p className="create__subtitle">Make room for something wonderful.</p>

        <label className="field">
          <span className="field__label">Wishlist name *</span>
          <input
            className="field__input"
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="Birthday wishes"
          />
        </label>

        <label className="field">
          <span className="field__label">Occasion *</span>
          <select
            className="field__input"
            name="occasionTypeId"
            value={form.occasionTypeId}
            onChange={handleChange}
          >
            <option value="">Choose an occasion</option>
            {occasionTypes.map((occasion) => (
              <option key={occasion.id} value={occasion.id}>
                {occasion.name}
              </option>
            ))}
          </select>
        </label>

        <label className="field">
          <span className="field__label">Date (optional)</span>
          <input
            className="field__input"
            type="date"
            name="date"
            value={form.date}
            onChange={handleChange}
          />
        </label>

        <label className="field">
          <span className="field__label">A note for your guests (optional)</span>
          <textarea
            className="field__input field__textarea"
            name="note"
            value={form.note}
            onChange={handleChange}
            maxLength={NOTE_MAX_LENGTH}
            placeholder="Thank you for being part of this celebration!"
          />
          <span className="field__counter">
            {form.note.length} / {NOTE_MAX_LENGTH}
          </span>
        </label>

        <p className="create__info">
          New wishlists are Link only: only people with your link can view them.
          You can change this later.
        </p>

        {error && (
          <p className="create__error" role="alert">
            {error}
          </p>
        )}

        <button type="submit" className="create__button">
          Continue to gifts
        </button>
      </form>
    </div>
  );
}

export default CreateWishlistPage;