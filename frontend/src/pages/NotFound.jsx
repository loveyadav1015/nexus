import { Link } from 'react-router-dom';
import { Radio, ArrowLeft } from 'lucide-react';

const NotFound = () => {
  return (
    <div className="min-h-screen bg-canvas flex items-center justify-center p-6 select-none">
      <div className="text-center max-w-sm">
        <div className="h-12 w-12 rounded-xl bg-surface border border-border-strong text-accent flex items-center justify-center mx-auto mb-5 shadow-xs">
          <Radio size={22} />
        </div>
        <span className="font-mono text-3xl font-bold tracking-tight text-ink-primary block mb-1">
          404
        </span>
        <h1 className="text-base font-semibold text-ink-primary mb-2">
          Page not found
        </h1>
        <p className="text-xs text-ink-muted mb-6 leading-relaxed">
          The channel, page, or conversation you are looking for does not exist or has been moved.
        </p>
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-surface border border-border-strong text-ink-primary hover:border-accent hover:text-accent text-xs font-medium transition-colors"
        >
          <ArrowLeft size={13} />
          Return to workspace
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
