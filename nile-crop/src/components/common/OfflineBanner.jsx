import useOnlineStatus from "@hooks/useOnlineStatus";
import { useTranslation } from "react-i18next";

export default function OfflineBanner() {
  const isOnline = useOnlineStatus();
  const { t } = useTranslation();

  if (isOnline) return null;

  return (
    <div className="fixed inset-x-4 top-4 z-50 rounded-2xl border border-amber-300 bg-amber-50 px-4 py-3 text-center text-sm font-medium text-amber-900 shadow-lg">
      {t("offlineBanner")}
    </div>
  );
}
