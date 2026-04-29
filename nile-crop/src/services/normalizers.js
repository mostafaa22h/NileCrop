export function normalizeCropResponse(payload) {
  const candidates = payload?.recommendations || payload?.crops || payload?.top_crops || payload?.results || [];

  if (Array.isArray(candidates)) {
    return candidates.slice(0, 3).map((item, index) => ({
      id: item.id || item.name || item.crop || index,
      name: item.name || item.crop || item.title || `Crop ${index + 1}`,
      score: item.score ?? item.suitability ?? item.confidence ?? item.percentage ?? null,
      reason: item.reason || item.description || item.summary || item.note || ""
    }));
  }

  if (typeof candidates === "object" && candidates) {
    return Object.entries(candidates).slice(0, 3).map(([name, score], index) => ({
      id: `${name}-${index}`,
      name,
      score,
      reason: ""
    }));
  }

  return [];
}

export function normalizeDiseaseResponse(payload) {
  const arabicDetails = payload?.arabic_details || {};
  const rawDisease = payload?.disease || arabicDetails?.name_ar || payload?.label || payload?.prediction || payload?.class_name || "";
  const isUnknownDisease = String(rawDisease).trim().toLowerCase() === "unknown";

  return {
    disease: isUnknownDisease ? "المرض غير متعارف عليه" : rawDisease,
    confidence: payload?.confidence ?? payload?.score ?? payload?.probability ?? payload?.accuracy ?? null,
    treatment: isUnknownDisease
      ? "تعذر تحديد المرض من الصورة الحالية. جرّب صورة أوضح ومقربة للجزء المصاب."
      : payload?.treatment || arabicDetails?.treatment || payload?.remedy || payload?.recommendation || payload?.care || ""
  };
}
