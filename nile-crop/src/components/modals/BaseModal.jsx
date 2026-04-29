import { useEffect } from "react";

export default function BaseModal({ titleId, title, subtitle, badge, navItems, onClose, children }) {
  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <section className="modal-shell" role="dialog" aria-modal="true" aria-labelledby={titleId} onClick={(event) => event.stopPropagation()}>
        <header className="modal-topbar">
          <button type="button" className="modal-close" onClick={onClose}>اغلاق</button>
          <nav className="modal-nav" aria-label="modal navigation">
            {navItems.map((item) => <span key={item}>{item}</span>)}
          </nav>
          <div className="modal-brand">Nile Crop</div>
        </header>

        <div className="modal-body">
          <section className="modal-heading">
            <span className="modal-kicker">{badge}</span>
            <h2 id={titleId}>{title}</h2>
            <p>{subtitle}</p>
          </section>
          {children}
        </div>
      </section>
    </div>
  );
}
