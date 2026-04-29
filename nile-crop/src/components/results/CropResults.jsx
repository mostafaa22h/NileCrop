export default function CropResults({ title, results }) {
  if (!results.length) return null;

  return (
    <section className="w-full max-w-5xl pt-6 text-right">
      <h3 className="mb-4 text-2xl font-extrabold text-brand-dark">{title}</h3>

      <div className="grid gap-4 md:grid-cols-3">
        {results.map((result, index) => {
          const isPrimary = index === 0;

          return (
            <article
              key={result.id}
              className={`rounded-[28px] border p-5 shadow-sm ${
                isPrimary
                  ? "border-green-300 bg-gradient-to-b from-white to-green-50 shadow-green-100/70"
                  : "border-brand-primary/10 bg-white"
              }`}
            >
              <p className="mb-3 text-xs font-extrabold tracking-[0.18em] text-green-700">
                {isPrimary ? "أفضل اختيار" : `محصول بديل ${index}`}
              </p>

              <h4 className="mb-3 text-3xl font-extrabold text-brand-dark">{result.name}</h4>

              <p className="mb-4 min-h-[96px] text-sm leading-8 text-brand-text/75">
                {result.reason || "ترشيح أولي بناءً على بيانات المدينة والبيئة الزراعية."}
              </p>

              {result.score !== null && result.score !== undefined ? (
                <div className="rounded-2xl bg-brand-surface px-4 py-3 text-sm font-extrabold text-brand-dark">
                  نسبة التوافق: {typeof result.score === "number" ? `${Math.round(result.score)}%` : result.score}
                </div>
              ) : null}
            </article>
          );
        })}
      </div>
    </section>
  );
}
