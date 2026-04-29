import { Component } from "react";

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error) {
    console.error(error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-brand-surface px-4">
          <div className="max-w-lg rounded-3xl border border-brand-primary/10 bg-white p-8 text-center shadow-glow">
            <p className="mb-3 text-sm font-semibold text-brand-primary">Nile Crop</p>
            <h1 className="mb-3 text-2xl font-bold text-brand-text">حدث خطأ غير متوقع</h1>
            <p className="mb-6 text-brand-text/70">حصلت مشكلة أثناء تحميل الصفحة. حاول إعادة التحديث أو المحاولة مرة أخرى بعد قليل.</p>
            <button type="button" className="rounded-2xl bg-brand-primary px-5 py-3 font-semibold text-white" onClick={() => window.location.reload()}>
              إعادة المحاولة
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
