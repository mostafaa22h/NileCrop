import { useTranslation } from "react-i18next";

function LanguageToggle() {
  const { i18n } = useTranslation();
  const isArabic = i18n.language.startsWith("ar");

  return (
    <button
      type="button"
      onClick={() => i18n.changeLanguage(isArabic ? "en" : "ar")}
      className="rounded-full border border-brand-primary/12 bg-white px-4 py-2 text-sm font-semibold text-brand-dark transition hover:border-brand-primary/30 hover:bg-brand-surface"
    >
      {isArabic ? "EN" : "AR"}
    </button>
  );
}

export default function Navbar() {
  const { t } = useTranslation();

  return (
    <header className="sticky top-0 z-20 bg-white/70 backdrop-blur-xl">
      <div className="mx-auto mt-3 flex w-full max-w-7xl items-center justify-between gap-4 rounded-full border border-brand-primary/10 bg-white/90 px-4 py-3 shadow-[0_10px_30px_rgba(20,83,45,0.06)] sm:px-6">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-full">
            <img
              src="/nile-crop-logo-transparent.png"
              alt="Nile Crop logo"
              className="h-full w-full object-cover"
            />
          </div>
          <div>
            <p className="text-lg font-black tracking-tight text-brand-dark">Nile Crop</p>
            <p className="text-xs text-brand-text/60">{t("navbar.tagline")}</p>
          </div>
        </div>

        <nav className="hidden items-center gap-2 md:flex">
          <span className="rounded-full bg-brand-surface px-4 py-2 text-sm font-medium text-brand-dark">
            {t("navbar.links.crop")}
          </span>
          <span className="rounded-full bg-brand-surface px-4 py-2 text-sm font-medium text-brand-dark">
            {t("navbar.links.disease")}
          </span>
        </nav>

        <LanguageToggle />
      </div>
    </header>
  );
}
