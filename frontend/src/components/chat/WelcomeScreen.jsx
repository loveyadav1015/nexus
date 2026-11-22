import { Radio, Menu } from 'lucide-react';

const WelcomeScreen = ({ onToggleSidebar }) => {
  return (
    <div className="flex-1 flex flex-col items-center justify-center bg-canvas p-6 text-center select-none">
      <div className="h-12 w-12 rounded-xl bg-surface border border-border-strong text-accent flex items-center justify-center mb-4 shadow-xs">
        <Radio size={24} />
      </div>
      <h2 className="text-base font-semibold text-ink-primary tracking-tight mb-1">
        Welcome to your team workspace
      </h2>
      <p className="text-xs text-ink-muted max-w-sm leading-relaxed mb-3">
        Select a channel from the sidebar or start a 1-on-1 direct message with a teammate.
      </p>
      {onToggleSidebar && (
        <button
          type="button"
          onClick={onToggleSidebar}
          className="md:hidden inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border-strong bg-surface text-ink-primary hover:border-accent text-xs font-medium transition-colors"
        >
          <Menu size={13} />
          Open channels & DMs
        </button>
      )}
    </div>
  );
};

export default WelcomeScreen;
