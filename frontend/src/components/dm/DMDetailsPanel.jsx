import { X, Calendar, AtSign, AlignLeft } from 'lucide-react';
import UserAvatar from '../ui/UserAvatar';
import { format } from 'date-fns';

const DMDetailsPanel = ({ user, onClose }) => {
  if (!user) return null;

  const statusConfig = {
    online: { dot: 'bg-status-online', text: 'Active now' },
    away: { dot: 'bg-status-away', text: 'Away' },
    offline: { dot: 'bg-status-offline', text: 'Offline' }
  };
  const status = user.status || 'offline';
  const config = statusConfig[status] || statusConfig.offline;

  return (
    <aside
      aria-label="Teammate profile details"
      className="w-dm-details border-l border-border-subtle bg-surface flex flex-col h-full flex-shrink-0 animate-in slide-in-from-right-4 duration-150"
    >
      <div className="h-header border-b border-border-subtle px-4 flex items-center justify-between flex-shrink-0">
        <span className="font-semibold text-ink-primary text-xs tracking-tight">Profile Details</span>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="text-ink-faint hover:text-ink-primary p-1 rounded-md hover:bg-surface-hover transition-colors"
            aria-label="Close details panel"
          >
            <X size={15} />
          </button>
        )}
      </div>

      <div className="p-5 flex flex-col items-center gap-2 border-b border-border-subtle bg-canvas/40 text-center">
        <UserAvatar user={user} size="lg" showStatus />
        <h3 className="text-sm font-semibold text-ink-primary tracking-tight mt-1">
          {user.display_name || user.username}
        </h3>
        <div className="flex items-center gap-1.5">
          <span className={`w-2 h-2 rounded-full ${config.dot}`} />
          <span className="text-xs text-ink-muted">{config.text}</span>
        </div>
      </div>

      <div className="p-4 space-y-4 overflow-y-auto flex-1">
        <div>
          <span className="text-[10px] font-mono text-ink-faint uppercase tracking-wider block mb-1">
            Username
          </span>
          <div className="flex items-center gap-1.5 text-xs text-ink-primary font-mono">
            <AtSign size={13} className="text-ink-faint" />
            <span>{user.username}</span>
          </div>
        </div>

        {user.bio && (
          <div>
            <span className="text-[10px] font-mono text-ink-faint uppercase tracking-wider block mb-1">
              About
            </span>
            <div className="flex items-start gap-1.5 text-xs text-ink-secondary leading-relaxed">
              <AlignLeft size={13} className="text-ink-faint mt-0.5 shrink-0" />
              <span>{user.bio}</span>
            </div>
          </div>
        )}

        {user.created_at && (
          <div>
            <span className="text-[10px] font-mono text-ink-faint uppercase tracking-wider block mb-1">
              Joined Team
            </span>
            <div className="flex items-center gap-1.5 text-xs text-ink-secondary">
              <Calendar size={13} className="text-ink-faint" />
              <span>{format(new Date(user.created_at), 'MMMM d, yyyy')}</span>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};

export default DMDetailsPanel;
