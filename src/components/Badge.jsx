
import './Badge.css';

export default function Badge({ children, variant = 'default' }) {
  return (
    
    <span className={`omnia-badge omnia-badge--${variant}`}>
      {children}
    </span>

  );
}



