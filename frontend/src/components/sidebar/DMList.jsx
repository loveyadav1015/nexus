import { useState } from 'react';
import { Plus } from 'lucide-react';
import useUserStore from '../../store/userStore';
import useAuthStore from '../../store/authStore';
import useChannelStore from '../../store/channelStore';
import useDMStore from '../../store/dmStore';
import useMessageStore from '../../store/messageStore';
import { getOrCreateConversation } from '../../api/dms';
import UserPickerModal from './UserPickerModal';

const DMList = () => {
  const users = useUserStore((s) => s.users);
  const onlineUsers = useUserStore((s) => s.onlineUsers);
  const currentUser = useAuthStore((s) => s.user);
  const activeConversation = useDMStore((s) => s.activeConversation);
  const setActiveConversation = useDMStore((s) => s.setActiveConversation);
  const setActiveChannel = useChannelStore((s) => s.setActiveChannel);
  const clearActiveThread = useMessageStore((s) => s.clearActiveThread);
  const [showUserPicker, setShowUserPicker] = useState(false);

  const otherUsers = users.filter((u) => u.id !== currentUser?.id);

  const handleSelectDM = async (user) => {
    try {
      const res = await getOrCreateConversation(user.id);
      setActiveConversation({ ...res.data.conversation, otherUser: user });
      setActiveChannel(null);
      clearActiveThread();
    } catch (err) {
      console.error('Failed to open DM:', err);
    }
  };

  const statusConfig = {
    online: { dot: 'bg-status-online', text: 'Online' },
    away: { dot: 'bg-status-away', text: 'Away' },
    offline: { dot: 'bg-status-offline', text: 'Offline' }
  };

  return (
    <div>
      <div className="flex items-center justify-between px-2 mb-1.5">
        <span className="text-xs font-semibold text-ink-secondary">
          Direct Messages
        </span>
        <button
          type="button"
          onClick={() => setShowUserPicker(true)}
          className="text-ink-faint hover:text-ink-primary p-0.5 rounded hover:bg-surface-hover transition-colors"
          aria-label="Start new direct message"
          title="New direct message"
        >
          <Plus size={14} />
        </button>
      </div>

      <nav aria-label="Direct messages" className="space-y-0.5">
        {otherUsers.map((u) => {
          const status = onlineUsers[u.id] || u.status || 'offline';
          const isActive = activeConversation?.otherUser?.id === u.id;
          const config = statusConfig[status] || statusConfig.offline;

          return (
            <button
              key={u.id}
              type="button"
              onClick={() => handleSelectDM(u)}
              className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-medium text-left transition-colors ${
                isActive
                  ? 'bg-surface text-accent font-semibold shadow-xs border border-border-strong'
                  : 'text-ink-secondary hover:text-ink-primary hover:bg-surface-hover'
              }`}
            >
              <span
                aria-label={`Status: ${config.text}`}
                title={`Status: ${config.text}`}
                className={`w-2 h-2 rounded-full flex-shrink-0 ${config.dot}`}
              />
              <span className="truncate">{u.display_name || u.username}</span>
            </button>
          );
        })}
      </nav>

      <UserPickerModal
        isOpen={showUserPicker}
        onClose={() => setShowUserPicker(false)}
      />
    </div>
  );
};

export default DMList;
