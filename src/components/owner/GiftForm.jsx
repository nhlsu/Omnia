import { useState } from "react";
import { CameraIcon, ImageIcon } from "./icons.jsx";
import "./GiftForm.css";

const MAX_QUANTITY = 20; // W7 note: quantity 1–20
const PHOTO_TYPES = ["image/jpeg", "image/png", "image/webp"]; // W7b note
const PHOTO_MAX_BYTES = 5 * 1024 * 1024; // W7b note: max 5 MB

// Shared gift form for W7 (variant "auto"), W7b ("manual") and W9 ("edit").
// - initial:      starting values (fetched details, or the gift being edited)
// - banner:       optional box at the top (green "filled in", yellow "can't auto-fill")
// - minQuantity:  lowest allowed quantity (W9: units already reserved)
// - quantityNote: optional box under the quantity (W9's yellow note)
// - onSubmit:     called with the form values; may throw (your validator's messages)
// - footer:       optional content under the button (W9's "Remove gift")
function GiftForm({
  initial = {},
  variant = "auto",
  banner = null,
  minQuantity = 1,
  quantityNote = null,
  submitLabel = "Save gift",
  onSubmit,
  footer = null,
}) {
  const [form, setForm] = useState({
    name: initial.name ?? "",
    price: initial.price ?? "",
    quantity: initial.quantity ?? 1,
    notes: initial.notes ?? "",
    productUrl: initial.productUrl ?? "",
    imageUrl: initial.imageUrl ?? null,
  });
  const [error, setError] = useState("");

  function handleChange(event) {
    const { name, value } = event.target;
    setForm({ ...form, [name]: value });
  }

  function changeQuantity(step) {
    setForm({
      ...form,
      quantity: Math.min(
        MAX_QUANTITY,
        Math.max(minQuantity, form.quantity + step)
      ),
    });
  }

  function handlePhoto(event) {
    const file = event.target.files[0];
    if (!file) {
      return;
    }

    if (!PHOTO_TYPES.includes(file.type)) {
      setError("Choose a JPG, PNG or WEBP image.");
      return;
    }

    if (file.size > PHOTO_MAX_BYTES) {
      setError("The photo must be 5 MB or smaller.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => setForm({ ...form, imageUrl: reader.result });
    reader.readAsDataURL(file);
  }

  function handleSubmit(event) {
    event.preventDefault();
    setError("");

    try {
      onSubmit(form);
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <form className="gift-form" onSubmit={handleSubmit} noValidate>
      {banner}

      {variant === "manual" ? (
        <label className="gift-form__photo-button">
          <CameraIcon size={18} />
          {form.imageUrl ? "Change gift photo" : "Add a gift photo (optional)"}
          <input
            type="file"
            accept={PHOTO_TYPES.join(",")}
            onChange={handlePhoto}
            hidden
          />
        </label>
      ) : null}

      {variant !== "manual" || form.imageUrl ? (
        <div className="gift-form__image">
          {form.imageUrl ? <img src={form.imageUrl} alt="" /> : <ImageIcon size={40} />}
        </div>
      ) : null}

      <label className="field">
        <span className="field__label">Gift name *</span>
        <input
          className="field__input"
          name="name"
          value={form.name}
          onChange={handleChange}
          placeholder="e.g. Instant camera"
        />
      </label>

      {variant === "manual" && (
        <label className="field">
          <span className="field__label">Product link (optional)</span>
          <input
            className="field__input"
            name="productUrl"
            value={form.productUrl}
            onChange={handleChange}
            placeholder="https://"
          />
        </label>
      )}

      <label className="field">
        <span className="field__label">Price (SAR)</span>
        <input
          className="field__input"
          name="price"
          inputMode="decimal"
          value={form.price}
          onChange={handleChange}
        />
      </label>

      <div className="gift-form__quantity">
        <span className="field__label">Desired quantity</span>
        <div className="stepper">
          <button
            type="button"
            onClick={() => changeQuantity(-1)}
            disabled={form.quantity <= minQuantity}
            aria-label="Less"
          >
            −
          </button>
          <span className="stepper__value">{form.quantity}</span>
          <button
            type="button"
            onClick={() => changeQuantity(1)}
            disabled={form.quantity >= MAX_QUANTITY}
            aria-label="More"
          >
            +
          </button>
        </div>
      </div>

      {quantityNote}

      {variant === "auto" && (
        <label className="field">
          <span className="field__label">Notes (optional)</span>
          <input
            className="field__input"
            name="notes"
            value={form.notes}
            onChange={handleChange}
            placeholder="e.g. Cream colour, please."
          />
        </label>
      )}

      {error && (
        <p className="gift-form__error" role="alert">
          {error}
        </p>
      )}

      <button type="submit" className="gift-form__submit">
        {submitLabel}
      </button>

      {footer}
    </form>
  );
}

export default GiftForm;