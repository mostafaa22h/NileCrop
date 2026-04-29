import { useEffect, useState } from "react";

const heroSlides = [
  {
    image:
      "https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=1200&q=80",
    title: "ترشيح المحصول حسب ظروف الأرض",
  },
  {
    image:
      "https://images.unsplash.com/photo-1464226184884-fa280b87c399?auto=format&fit=crop&w=1200&q=80",
    title: "متابعة الحقل بصريًا بشكل أوضح",
  },
  {
    image:
      "https://images.unsplash.com/photo-1471193945509-9ad0617afabf?auto=format&fit=crop&w=1200&q=80",
    title: "حلول ذكية للمزارع الحديثة",
  },
];

export default function HomePage({
  onRecommendClick,
  onDiseaseClick,
}) {
  const [activeSlide, setActiveSlide] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setActiveSlide((current) => (current + 1) % heroSlides.length);
    }, 3200);

    return () => window.clearInterval(timer);
  }, []);

  return (
    <section className="hero" dir="rtl">
      <div className="hero-container">
        <div className="hero-text">
          <span className="hero-kicker">حلول زراعية ذكية</span>
          <h1>قرارات زراعية أدق تبدأ من واجهة واحدة</h1>
          <h2>ترشيح المحصول المناسب وفحص أمراض النبات بتجربة سريعة وواضحة</h2>
          <p>
            نوفر لك أدوات عملية تساعدك على تقييم حالة الأرض، واختيار المحصول
            الأنسب، وفحص صور النباتات لاكتشاف المؤشرات المرضية الأولية بسهولة
            واحترافية.
          </p>

          <div className="hero-buttons">
            <button className="btn-primary" type="button" onClick={onRecommendClick}>
              ترشيح محصول
            </button>

            <button className="btn-secondary" type="button" onClick={onDiseaseClick}>
              كشف مرض
            </button>
          </div>
        </div>

        <div className="hero-image">
          <div className="hero-slider-card">
            <div className="hero-slider-label">
              <span className="hero-slider-dot" />
              {heroSlides[activeSlide].title}
            </div>

            <div className="hero-slider-frame">
              {heroSlides.map((slide, index) => (
                <img
                  key={slide.image}
                  src={slide.image}
                  alt={slide.title}
                  className={`hero-slide ${index === activeSlide ? "is-active" : ""}`}
                />
              ))}
            </div>

            <div className="hero-slider-indicators" aria-label="مؤشرات الصور">
              {heroSlides.map((slide, index) => (
                <button
                  key={slide.title}
                  type="button"
                  className={`hero-indicator ${index === activeSlide ? "is-active" : ""}`}
                  onClick={() => setActiveSlide(index)}
                  aria-label={`عرض الصورة ${index + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
