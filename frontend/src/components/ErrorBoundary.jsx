import { Component } from 'react';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Uncaught error:", error, errorInfo);
    this.setState({ errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#1a1d21] text-white p-8 overflow-auto">
          <h1 className="text-2xl font-bold text-red-500 mb-4">Something went wrong.</h1>
          <details className="whitespace-pre-wrap bg-[#222529] p-4 rounded border border-[#383a40] text-sm text-gray-300">
            <summary className="cursor-pointer font-semibold text-gray-400 mb-2">View Error Details</summary>
            {this.state.error && this.state.error.toString()}
            <br />
            {this.state.errorInfo?.componentStack}
          </details>
          <button
            onClick={() => window.location.reload()}
            className="mt-6 px-4 py-2 bg-[#4a55c8] hover:bg-[#5561d4] rounded text-white"
          >
            Reload Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
