import "./modal-screens.css";

const detectionHints = [
  "ارفع صورة واضحة للورقة أو الجزء المصاب بإضاءة جيدة.",
  "يفضل أن تكون الخلفية بسيطة حتى تظهر العلامات المرضية بوضوح.",
];

export default function DiseaseDetectionPage({ onClose }) {
  return (
    <div className="modal-overlay" dir="rtl" onClick={onClose}>
      <section
        className="modal-shell disease-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="disease-title"
        onClick={(event) => event.stopPropagation()}
      >
        <header className="modal-topbar">
          <button type="button" className="modal-close" onClick={onClose}>
            اغلاق
          </button>

          <nav className="modal-nav" aria-label="روابط سريعة">
            <span>الفحص</span>
            <span>الصور</span>
            <span>الدعم</span>
          </nav>

          <div className="modal-brand">Nile Crop</div>
        </header>

        <div className="modal-body">
          <section className="modal-heading">
            <span className="modal-kicker">كشف مرض</span>
            <h2 id="disease-title">افحص صورة النبات واحصل على مؤشر أولي</h2>
            <p>
              ارفع صورة للورقة أو الثمرة المتأثرة ليبدأ النظام في فحص العلامات
              المرئية بشكل مبدئي.
            </p>
          </section>

          <label className="upload-zone">
            <input type="file" accept="image/*" />
            <div className="upload-icon" aria-hidden="true">
              +
            </div>
            <strong>اسحب الصورة هنا أو اضغط للرفع</strong>
            <span>JPG, PNG حتى 10MB</span>
          </label>

          <button type="button" className="modal-primary-button">
            افحص الصورة
          </button>

          <section className="modal-notes" aria-label="ملاحظات سريعة">
            {detectionHints.map((tip) => (
              <p key={tip}>{tip}</p>
            ))}
          </section>
        </div>
      </section>
    </div>
  );
}
