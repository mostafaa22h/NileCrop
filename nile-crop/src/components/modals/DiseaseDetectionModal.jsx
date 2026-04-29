import imageCompression from "browser-image-compression";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import BaseModal from "./BaseModal";
import LoadingSpinner from "@components/common/LoadingSpinner";
import DiseaseResultCard from "@components/results/DiseaseResultCard";
import { detectDisease, extractApiErrorMessage } from "@services/api";
import { normalizeDiseaseResponse } from "@services/normalizers";

async function compressFile(file) {
  const compressed = await imageCompression(file, {
    maxSizeMB: 1,
    maxWidthOrHeight: 1280,
    useWebWorker: true
  });

  if (compressed instanceof File && compressed.name) {
    return compressed;
  }

  const extension = file.name?.includes(".") ? file.name.slice(file.name.lastIndexOf(".")) : ".jpg";
  return new File([compressed], `upload${extension}`, {
    type: compressed.type || file.type || "image/jpeg",
    lastModified: Date.now()
  });
}

export default function DiseaseDetectionModal({ onClose }) {
  const { t } = useTranslation();
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [result, setResult] = useState(null);

  const previewUrl = useMemo(() => (file ? URL.createObjectURL(file) : ""), [file]);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  async function updateFile(selectedFile) {
    if (!selectedFile) return;

    try {
      const compressed = await compressFile(selectedFile);
      setFile(compressed);
      setResult(null);
      setError("");
      setNotice(t("diseaseModal.notices.fileReady"));
    } catch {
      setError(t("diseaseModal.errors.compression"));
      setNotice("");
    }
  }

  async function handleSubmit() {
    if (!file) {
      setError(t("diseaseModal.errors.emptyImage"));
      setNotice("");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setNotice(t("diseaseModal.notices.analyzing"));
      const payload = await detectDisease(file);
      const normalized = normalizeDiseaseResponse(payload);

      if (!normalized.disease) {
        setError(t("diseaseModal.errors.noResults"));
        setNotice("");
        setResult(null);
      } else {
        setResult(normalized);
        setNotice(t("diseaseModal.notices.success"));
      }
    } catch (error) {
      setError(extractApiErrorMessage(error, t("diseaseModal.errors.server")));
      setNotice("");
      setResult(null);
    } finally {
      setLoading(false);
    }
  }

  return (
    <BaseModal
      titleId="disease-modal-title"
      title={t("diseaseModal.title")}
      subtitle={t("diseaseModal.subtitle")}
      badge={t("diseaseModal.badge")}
      navItems={[t("diseaseModal.nav.scan"), t("diseaseModal.nav.upload"), t("diseaseModal.nav.treatment")]}
      onClose={onClose}
    >
      <label
        className={`upload-zone ${isDragging ? "is-dragging" : ""}`}
        onDragOver={(event) => {
          event.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(event) => {
          event.preventDefault();
          setIsDragging(false);
          updateFile(event.dataTransfer.files?.[0]);
        }}
      >
        <input type="file" accept="image/*" onChange={(event) => updateFile(event.target.files?.[0])} />
        {previewUrl ? <img src={previewUrl} alt="Preview" className="preview-image" /> : <div className="upload-icon" aria-hidden="true">+</div>}
        <div className="upload-badge">{t("diseaseModal.uploadBadge")}</div>
        <strong>{t("diseaseModal.uploadTitle")}</strong>
        <span>{t("diseaseModal.uploadHint")}</span>
      </label>

      {notice ? <p className="status-message success">{notice}</p> : null}

      <div className="flex flex-wrap gap-3">
        <button type="button" className="modal-primary-button" onClick={handleSubmit}>{loading ? t("common.loading") : t("diseaseModal.submit")}</button>
        {(error || result) ? <button type="button" className="modal-secondary-button" onClick={() => { setError(""); setNotice(""); setResult(null); }}>{t("common.retry")}</button> : null}
      </div>

      {loading ? <LoadingSpinner label={t("diseaseModal.loadingLabel")} /> : null}
      {error ? <p className="status-message error">{error}</p> : null}
      <DiseaseResultCard title={t("diseaseModal.resultsTitle")} result={result} />
    </BaseModal>
  );
}
