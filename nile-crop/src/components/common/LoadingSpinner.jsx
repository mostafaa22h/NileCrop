export default function LoadingSpinner({ label = "Loading", fullScreen = false }) {
  return (
    <div className={["flex items-center justify-center gap-3 text-brand-dark", fullScreen ? "min-h-screen bg-brand-surface" : "py-10"].join(" ")}>
      <span className="h-4 w-4 animate-spin rounded-full border-2 border-brand-primary border-t-transparent" />
      <span className="text-sm font-medium">{label}</span>
    </div>
  );
}
