import { useEffect, useState } from 'react';
import { Mic, MicOff, AlertCircle } from 'lucide-react';

/**
 * Microphone button for speech-to-text dictation.
 * Displays listening animation and inline error banners for permission/no-speech errors.
 * Hides completely if speech recognition is unsupported in the current browser.
 */
const MicButton = ({
  supported,
  listening,
  onToggle,
  error,
  disabled = false
}) => {
  const [dismissedError, setDismissedError] = useState(null);
  const showError = Boolean(error && dismissedError !== error);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        setDismissedError(error);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  if (!supported) {
    return null;
  }

  return (
    <div className="relative inline-flex items-center">
      {showError && error && (
        <div
          role="alert"
          className="absolute bottom-full right-0 mb-2 z-30 flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-[#1f2023] border border-red-500/40 text-xs text-red-300 shadow-lg whitespace-nowrap animate-in fade-in slide-in-from-bottom-1"
        >
          <AlertCircle size={14} className="text-red-400 shrink-0" />
          <span>{error}</span>
          <button
            type="button"
            onClick={() => setDismissedError(error)}
            className="ml-1 text-gray-400 hover:text-gray-200 text-xs font-bold leading-none"
            aria-label="Dismiss error"
          >
            ×
          </button>
        </div>
      )}

      <button
        type="button"
        onClick={onToggle}
        disabled={disabled}
        aria-label={listening ? 'Stop dictation' : 'Start voice dictation'}
        aria-pressed={listening}
        title={listening ? 'Stop dictation' : 'Voice dictation'}
        className={`p-1.5 rounded transition-all flex items-center justify-center relative ${
          listening
            ? 'bg-red-500/20 text-red-400 ring-2 ring-red-500/60 animate-pulse'
            : 'text-gray-400 hover:text-gray-200 hover:bg-[#383a40]'
        } disabled:opacity-40 disabled:cursor-not-allowed`}
      >
        {listening ? <MicOff size={16} /> : <Mic size={16} />}
        {listening && (
          <span className="absolute -top-0.5 -right-0.5 flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
          </span>
        )}
      </button>
    </div>
  );
};

export default MicButton;
