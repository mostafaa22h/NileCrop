export default function DiseaseResultCard({ title, result }) {
  if (!result?.disease) return null;

  const confidenceValue = typeof result.confidence === "number" ? Math.round(result.confidence) : null;
  const isLowConfidence = confidenceValue !== null && confidenceValue < 70;
  const isUnknownDisease = result.disease === "المرض غير متعارف عليه";
  const cardClassName = isUnknownDisease
    ? "w-full rounded-3xl border border-slate-200 bg-slate-50 p-6 shadow-sm"
    : "w-full rounded-3xl border border-brand-primary/10 bg-white p-6 shadow-sm";

  return (
    <section className={cardClassName}>
      <p className="mb-2 text-xs font-bold uppercase tracking-[0.3em] text-brand-primary">{title}</p>
      <h3 className="mb-3 text-2xl font-bold text-brand-dark">{result.disease}</h3>
      {confidenceValue !== null ? (
        <p className="mb-3 text-sm font-semibold text-brand-dark/80">نسبة الثقة: {confidenceValue}%</p>
      ) : null}
      {isLowConfidence && !isUnknownDisease ? (
        <p className="mb-3 rounded-2xl bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-700">
          النتيجة مبدئية وثقتها منخفضة نسبيًا. يفضل رفع صورة أوضح للتأكيد.
        </p>
      ) : null}
      <p className="text-sm leading-7 text-brand-text/80">
        {result.treatment || "لا توجد توصيات علاجية متاحة حاليًا."}
      </p>
    </section>
  );
}
