import "./modal-screens.css";

const egyptianCities = [
  "القاهرة",
  "الجيزة",
  "الإسكندرية",
  "المنصورة",
  "طنطا",
  "الزقازيق",
  "الإسماعيلية",
  "بورسعيد",
  "السويس",
  "دمياط",
  "بنها",
  "دمنهور",
  "كفر الشيخ",
  "الفيوم",
  "بني سويف",
  "المنيا",
  "أسيوط",
  "سوهاج",
  "قنا",
  "الأقصر",
  "أسوان",
  "مرسى مطروح",
  "العريش",
  "شرم الشيخ",
  "الغردقة",
];

const recommendationTips = [
  "ابدأ باسم المدينة للحصول على ترشيح أولي مناسب للظروف المحلية.",
  "يمكنك اختيار المدينة من الاقتراحات لتسريع الإدخال وتقليل الأخطاء.",
];

export default function CropRecommendationPage({ onClose }) {
  return (
    <div className="modal-overlay" dir="rtl" onClick={onClose}>
      <section
        className="modal-shell recommendation-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="recommendation-title"
        onClick={(event) => event.stopPropagation()}
      >
        <header className="modal-topbar">
          <button type="button" className="modal-close" onClick={onClose}>
            اغلاق
          </button>

          <nav className="modal-nav" aria-label="روابط سريعة">
            <span>التحليل</span>
            <span>البيانات</span>
            <span>الدعم</span>
          </nav>

          <div className="modal-brand">Nile Crop</div>
        </header>

        <div className="modal-body">
          <section className="modal-heading">
            <span className="modal-kicker">ترشيح محصول</span>
            <h2 id="recommendation-title">اعرف المحصول الأنسب حسب مدينتك</h2>
            <p>
              أدخل اسم المدينة، وسنبدأ بترشيح أولي للمحاصيل المناسبة وفقًا
              للبيئة الزراعية المحيطة بها.
            </p>
          </section>

          <form className="recommendation-form" action="#">
            <label className="field-group">
              <span>اسم المدينة</span>
              <input
                type="text"
                list="egyptian-cities"
                placeholder="ابدأ بكتابة اسم المدينة"
              />
            </label>

            <datalist id="egyptian-cities">
              {egyptianCities.map((city) => (
                <option key={city} value={city} />
              ))}
            </datalist>

            <button type="submit" className="modal-primary-button">
              ابدأ التحليل
            </button>
          </form>

          <section className="modal-notes" aria-label="ملاحظات سريعة">
            {recommendationTips.map((tip) => (
              <p key={tip}>{tip}</p>
            ))}
          </section>
        </div>
      </section>
    </div>
  );
}
