import { Component } from "react";

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Unhandled application error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="grid min-h-screen place-items-center bg-ink-50 px-4 text-center dark:bg-ink-950">
          <div className="max-w-xl rounded-3xl border border-ink-100 bg-white p-10 shadow-soft dark:border-white/10 dark:bg-ink-900">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-jade-700 dark:text-jade-100">Unexpected error</p>
            <h1 className="mt-6 text-3xl font-extrabold text-ink-900 dark:text-white">Something went wrong.</h1>
            <p className="mt-4 text-sm leading-6 text-ink-600 dark:text-ink-100">
              The application encountered an unexpected problem. Refresh the page or contact support if the issue persists.
            </p>
            <pre className="mt-6 max-h-40 overflow-auto rounded-xl bg-ink-50 p-4 text-left text-xs text-ink-700 dark:bg-white/5 dark:text-ink-100">{String(this.state.error)}</pre>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
