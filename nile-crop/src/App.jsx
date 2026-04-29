import { lazy, Suspense, useEffect } from "react";
import { Route, Routes } from "react-router-dom";
import { useTranslation } from "react-i18next";
import ErrorBoundary from "@components/common/ErrorBoundary";
import LoadingSpinner from "@components/common/LoadingSpinner";
import OfflineBanner from "@components/common/OfflineBanner";

const HomePage = lazy(() => import("@pages/HomePage"));

function NotFoundPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-brand-surface px-4 text-center">
      <div>
        <p className="mb-3 text-sm font-semibold uppercase tracking-[0.3em] text-brand-primary">Nile Crop</p>
        <h1 className="mb-3 text-3xl font-bold text-brand-text">404</h1>
        <p className="text-brand-text/70">الصفحة المطلوبة غير موجودة حاليًا.</p>
      </div>
    </div>
  );
}

export default function App() {
  const { i18n } = useTranslation();

  useEffect(() => {
    const isArabic = i18n.language?.startsWith("ar");
    document.documentElement.lang = isArabic ? "ar" : "en";
    document.documentElement.dir = isArabic ? "rtl" : "ltr";
    document.body.dir = isArabic ? "rtl" : "ltr";
  }, [i18n.language]);

  return (
    <ErrorBoundary>
      <OfflineBanner />
      <Suspense fallback={<LoadingSpinner fullScreen label="جاري تحميل الواجهة" />}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Suspense>
    </ErrorBoundary>
  );
}
