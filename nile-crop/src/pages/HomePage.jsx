import { lazy, Suspense, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import Navbar from "@components/layout/Navbar";
import LoadingSpinner from "@components/common/LoadingSpinner";

const CropRecommendationModal = lazy(() => import("@components/modals/CropRecommendationModal"));
const DiseaseDetectionModal = lazy(() => import("@components/modals/DiseaseDetectionModal"));

const heroSlides = [
  {
    image: "https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=1200&q=80",
    titleKey: "hero.slides.crop"
  },
  {
    image: "https://images.unsplash.com/photo-1464226184884-fa280b87c399?auto=format&fit=crop&w=1200&q=80",
    titleKey: "hero.slides.monitoring"
  },
  {
    image: "https://images.unsplash.com/photo-1471193945509-9ad0617afabf?auto=format&fit=crop&w=1200&q=80",
    titleKey: "hero.slides.modern"
  }
];

function HomeHero({ onRecommendClick, onDiseaseClick }) {
  const { t } = useTranslation();
  const [activeSlide, setActiveSlide] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setActiveSlide((current) => (current + 1) % heroSlides.length);
    }, 3200);

    return () => window.clearInterval(timer);
  }, []);

  return (
    <section className="hero" dir={document.documentElement.dir}>
      <div className="hero-container">
        <div className="hero-text">
          <span className="hero-kicker">{t("hero.kicker")}</span>
          <h1>{t("hero.title")}</h1>
          <h2>{t("hero.subtitle")}</h2>
          <p>{t("hero.description")}</p>

          <div className="hero-buttons">
            <button className="btn-primary" type="button" onClick={onRecommendClick}>{t("hero.actions.crop")}</button>
            <button className="btn-secondary" type="button" onClick={onDiseaseClick}>{t("hero.actions.disease")}</button>
          </div>
        </div>

        <div className="hero-image">
          <div className="hero-slider-card">
            <div className="hero-slider-label">
              <span className="hero-slider-dot" />
              {t(heroSlides[activeSlide].titleKey)}
            </div>

            <div className="hero-slider-frame">
              {heroSlides.map((slide, index) => (
                <img key={slide.image} src={slide.image} alt={t(slide.titleKey)} className={`hero-slide ${index === activeSlide ? "is-active" : ""}`} />
              ))}
            </div>

            <div className="hero-slider-indicators" aria-label="hero indicators">
              {heroSlides.map((slide, index) => (
                <button key={slide.titleKey} type="button" className={`hero-indicator ${index === activeSlide ? "is-active" : ""}`} onClick={() => setActiveSlide(index)} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function QuickActions({ onRecommendClick, onDiseaseClick }) {
  const { t } = useTranslation();

  return (
    <section className="mx-auto grid w-full max-w-6xl gap-6 px-4 pb-12 md:grid-cols-2">
      <article className="rounded-[28px] border border-brand-primary/10 bg-white p-6 shadow-sm">
        <p className="mb-2 text-sm font-bold text-brand-primary">{t("quickActions.crop.badge")}</p>
        <h3 className="mb-3 text-2xl font-bold text-brand-dark">{t("quickActions.crop.title")}</h3>
        <p className="mb-5 text-sm leading-7 text-brand-text/70">{t("quickActions.crop.description")}</p>
        <button className="modal-primary-button !mt-0" type="button" onClick={onRecommendClick}>{t("quickActions.crop.cta")}</button>
      </article>

      <article className="rounded-[28px] border border-brand-primary/10 bg-white p-6 shadow-sm">
        <p className="mb-2 text-sm font-bold text-brand-primary">{t("quickActions.disease.badge")}</p>
        <h3 className="mb-3 text-2xl font-bold text-brand-dark">{t("quickActions.disease.title")}</h3>
        <p className="mb-5 text-sm leading-7 text-brand-text/70">{t("quickActions.disease.description")}</p>
        <button className="modal-primary-button !mt-0" type="button" onClick={onDiseaseClick}>{t("quickActions.disease.cta")}</button>
      </article>
    </section>
  );
}

export default function HomePage() {
  const [activeModal, setActiveModal] = useState(null);

  return (
    <div className="min-h-screen bg-brand-surface">
      <Navbar />
      <HomeHero onRecommendClick={() => setActiveModal("crop")} onDiseaseClick={() => setActiveModal("disease")} />
      <QuickActions onRecommendClick={() => setActiveModal("crop")} onDiseaseClick={() => setActiveModal("disease")} />

      <Suspense fallback={<LoadingSpinner label="جاري تحميل الأداة" />}>
        {activeModal === "crop" ? <CropRecommendationModal onClose={() => setActiveModal(null)} /> : null}
        {activeModal === "disease" ? <DiseaseDetectionModal onClose={() => setActiveModal(null)} /> : null}
      </Suspense>
    </div>
  );
}
