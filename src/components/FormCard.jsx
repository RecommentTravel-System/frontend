import '../login/Login.css';

export default function FormCard({ title, titleId, onClose, children, className = '' }) {
  return <div className={`login-card ${className}`}><div className="login-header"><h2 id={titleId}>{title}</h2><button type="button" className="close-btn" onClick={onClose} aria-label="Đóng">×</button></div><div className="login-divider-accent" />{children}</div>;
}
