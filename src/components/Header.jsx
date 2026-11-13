
import './Header.css';

export default function Header({ title, onBack, rightAction }) {
  return (
    <header className="omnia-header">
      <div className="omnia-header__left">
        {onBack ? (
          <button
            type="button"
            className="omnia-header__back"
            onClick={onBack}
          >
            <span aria-hidden="true">←</span> Back
          </button>
        ) : (
          <span className="omnia-header__brand">omnia</span>
        )}
      </div>

      {title && (
        <h1 className="omnia-header__title">{title}</h1>
      )}

      <div className="omnia-header__right">
        {rightAction}
      </div>
    </header>
  );
}
