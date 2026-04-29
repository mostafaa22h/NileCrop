import { useDeferredValue, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { egyptianCities, matchCitySuggestions } from "@data/egyptianCities";
import useGeolocation from "@hooks/useGeolocation";
import BaseModal from "./BaseModal";
import CropResults from "@components/results/CropResults";
import LoadingSpinner from "@components/common/LoadingSpinner";
import { extractApiErrorMessage, recommendCrop } from "@services/api";
import { normalizeCropResponse } from "@services/normalizers";

export default function CropRecommendationModal({ onClose }) {
  const { t, i18n } = useTranslation();
  const [city, setCity] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [results, setResults] = useState([]);
  const deferredCity = useDeferredValue(city);
  const { detectCity, status: geoStatus } = useGeolocation();

  const suggestions = useMemo(() => matchCitySuggestions(deferredCity, i18n.language), [deferredCity, i18n.language]);
  const visibleSuggestions = city.trim() ? suggestions : egyptianCities.slice(0, 6);

  async function handleSubmit(event) {
    event.preventDefault();
    if (!city.trim()) {
      setError(t("cropModal.errors.emptyCity"));
      setNotice("");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setNotice(t("cropModal.notices.searching"));
      const payload = await recommendCrop({ city: city.trim() });
      const normalized = normalizeCropResponse(payload);

      if (!normalized.length) {
        setError(t("cropModal.errors.noResults"));
        setNotice("");
        setResults([]);
      } else {
        setResults(normalized);
        setNotice(t("cropModal.notices.ready", { city: city.trim() }));
      }
    } catch (error) {
      setError(extractApiErrorMessage(error, t("cropModal.errors.server")));
      setNotice("");
      setResults([]);
    } finally {
      setLoading(false);
    }
  }

  async function handleUseLocation() {
    try {
      const nearestCity = await detectCity();
      setCity(i18n.language.startsWith("ar") ? nearestCity.nameAr : nearestCity.nameEn);
      setError("");
      setNotice(t("cropModal.notices.locationSet"));
    } catch {
      setError(t("cropModal.errors.location"));
      setNotice("");
    }
  }

  return (
    <BaseModal
      titleId="crop-modal-title"
      title={t("cropModal.title")}
      subtitle={t("cropModal.subtitle")}
      badge={t("cropModal.badge")}
      navItems={[t("cropModal.nav.analysis"), t("cropModal.nav.location"), t("cropModal.nav.results")]}
      onClose={onClose}
    >
      <form className="recommendation-form" onSubmit={handleSubmit}>
        <label className="field-group">
          <span>{t("cropModal.cityLabel")}</span>
          <input type="text" value={city} onChange={(event) => setCity(event.target.value)} placeholder={t("cropModal.cityPlaceholder")} />
        </label>

        <div className="flex flex-wrap gap-3">
          <button type="submit" className="modal-primary-button">{loading ? t("common.loading") : t("cropModal.submit")}</button>
          <button type="button" className="modal-secondary-button" onClick={handleUseLocation}>
            {geoStatus === "loading" ? t("common.loading") : t("cropModal.useLocation")}
          </button>
          {(error || results.length) ? <button type="button" className="modal-secondary-button" onClick={() => { setError(""); setNotice(""); setResults([]); }}>{t("common.retry")}</button> : null}
        </div>
      </form>

      {notice ? <p className="status-message success">{notice}</p> : null}

      <div className="suggestions-panel">
        <p className="suggestions-title">{t("cropModal.suggestionsTitle")}</p>
        <div className="suggestions-list">
          {visibleSuggestions.map((suggestion) => {
            const label = i18n.language.startsWith("ar") ? suggestion.nameAr : suggestion.nameEn;
            return <button key={suggestion.nameEn} type="button" className="suggestion-chip" onClick={() => {
              setCity(label);
              setError("");
              setNotice(t("cropModal.notices.citySelected", { city: label }));
            }}>{label}</button>;
          })}
        </div>
      </div>

      {loading ? <LoadingSpinner label={t("cropModal.loadingLabel")} /> : null}
      {error ? <p className="status-message error">{error}</p> : null}
      <CropResults title={t("cropModal.resultsTitle")} results={results} />
    </BaseModal>
  );
}
