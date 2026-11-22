import { useState } from 'react';
import { Search, Hash, Menu } from 'lucide-react';
import SearchBar from '../ui/SearchBar';

const ChatHeader = ({ channel, onToggleSidebar }) => {
  const [showSearch, setShowSearch] = useState(false);

  if (!channel) return null;

  return (
    <header className="h-header border-b border-border-subtle flex items-center px-4 sm:px-5 gap-2.5 sm:gap-3 bg-canvas/80 backdrop-blur-xs relative flex-shrink-0 z-10">
      {onToggleSidebar && (
        <button
          type="button"
          onClick={onToggleSidebar}
          className="md:hidden p-1.5 -ml-1 rounded-md text-ink-secondary hover:text-ink-primary hover:bg-surface-hover transition-colors flex-shrink-0"
          aria-label="Toggle channels sidebar"
          title="Toggle channels sidebar"
        >
          <Menu size={16} />
        </button>
      )}

      <div className="flex items-center gap-2 flex-1 min-w-0">
        <Hash size={15} className="text-ink-faint flex-shrink-0" />
        <span className="font-semibold text-ink-primary text-sm tracking-tight truncate">
          {channel.name}
        </span>
        {channel.description && (
          <>
            <div className="hidden sm:block w-px h-3.5 bg-border-strong mx-1.5 flex-shrink-0" />
            <span className="hidden sm:inline text-xs text-ink-muted truncate max-w-sm">
              {channel.description}
            </span>
          </>
        )}
      </div>

      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => setShowSearch(!showSearch)}
          className="p-1.5 rounded-md text-ink-muted hover:text-ink-primary hover:bg-surface-hover transition-colors"
          aria-label="Search messages"
          title="Search messages"
        >
          <Search size={15} />
        </button>
      </div>

      {showSearch && <SearchBar onClose={() => setShowSearch(false)} />}
    </header>
  );
};

export default ChatHeader;
