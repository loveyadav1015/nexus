import { useState } from 'react';
import { Radio, Settings, Sun, Moon, X } from 'lucide-react';
import ChannelList from './ChannelList';
import DMList from './DMList';
import UserAvatar from '../ui/UserAvatar';
import useAuthStore from '../../store/authStore';
import UserProfileModal from '../profile/UserProfileModal';

const Sidebar = ({ onCloseMobile }) => {
  const user = useAuthStore((s) => s.user);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [isDark, setIsDark] = useState(() => {
    try {
      return document.documentElement.classList.contains('dark');
    } catch {
      return true;
    }
  });

  const handleToggleTheme = () => {
    if (typeof window !== 'undefined' && window.__nexusToggleTheme) {
      window.__nexusToggleTheme();
      setIsDark((prev) => !prev);
    }
  };

  return (
    <aside
      className="w-sidebar h-screen bg-sidebar border-r border-border-subtle flex flex-col flex-shrink-0 select-none"
      aria-label="Workspace sidebar"
    >
      {/* Workspace Header */}
      <div className="h-header flex items-center justify-between px-4 border-b border-border-subtle">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="h-6 w-6 rounded bg-surface border border-border-strong text-accent flex items-center justify-center flex-shrink-0">
            <Radio size={13} />
          </div>
          <span className="font-semibold text-ink-primary text-sm tracking-tight truncate">
            Nexus Workspace
          </span>
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={handleToggleTheme}
            title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            className="text-ink-secondary hover:text-ink-primary p-1 rounded-md hover:bg-surface-hover transition-colors"
            aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {isDark ? <Sun size={15} /> : <Moon size={15} />}
          </button>
          {onCloseMobile && (
            <button
              type="button"
              onClick={onCloseMobile}
              className="md:hidden text-ink-secondary hover:text-ink-primary p-1 rounded-md hover:bg-surface-hover transition-colors"
              aria-label="Close sidebar"
            >
              <X size={16} />
            </button>
          )}
        </div>
      </div>

      {/* Channel and DM List */}
      <div className="flex-1 overflow-y-auto px-2 py-3 space-y-5">
        <ChannelList />
        <DMList />
      </div>

      {/* User Footer Anchor */}
      <div className="border-t border-border-subtle p-3 mt-auto bg-surface/50">
        <div className="flex items-center gap-2.5">
          <UserAvatar user={user} size="md" showStatus />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-ink-primary truncate leading-tight">
              {user?.display_name || user?.username}
            </p>
            <p className="text-[11px] text-ink-faint font-mono truncate leading-tight">
              @{user?.username}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowProfileModal(true)}
            className="text-ink-secondary hover:text-ink-primary p-1.5 rounded-md hover:bg-surface-hover transition-colors"
            aria-label="Profile and preferences"
            title="Profile & preferences"
          >
            <Settings size={15} />
          </button>
        </div>
      </div>

      <UserProfileModal
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
      />
    </aside>
  );
};

export default Sidebar;
