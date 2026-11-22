import { useState, useEffect } from 'react';
import { Search, X } from 'lucide-react';
import useUserStore from '../../store/userStore';
import useAuthStore from '../../store/authStore';
import useChannelStore from '../../store/channelStore';
import useDMStore from '../../store/dmStore';
import useMessageStore from '../../store/messageStore';
import { getOrCreateConversation } from '../../api/dms';
import UserAvatar from '../ui/UserAvatar';

const UserPickerModal = ({ isOpen, onClose }) => {
  const [search, setSearch] = useState('');
  const users = useUserStore((s) => s.users);
  const currentUser = useAuthStore((s) => s.user);
  const setActiveChannel = useChannelStore((s) => s.setActiveChannel);
  const setActiveConversation = useDMStore((s) => s.setActiveConversation);
  const clearActiveThread = useMessageStore((s) => s.clearActiveThread);

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const filteredUsers = users
    .filter((u) => u.id !== currentUser?.id)
    .filter((u) =>
      (u.display_name || u.username).toLowerCase().includes(search.toLowerCase())
    );

  const handleSelectUser = async (user) => {
    try {
      const res = await getOrCreateConversation(user.id);
      setActiveConversation({ ...res.data.conversation, otherUser: user });
      setActiveChannel(null);
      clearActiveThread();
      onClose();
    } catch (err) {
      console.error('Failed to start DM:', err);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Direct message picker"
        className="bg-surface border border-border-strong rounded-xl w-full max-w-sm shadow-xl max-h-[460px] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-2.5 px-4 py-3 border-b border-border-subtle bg-sidebar/50">
          <Search size={15} className="text-ink-faint flex-shrink-0" />
          <input
            type="text"
            placeholder="Search team members..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            autoFocus
            className="flex-1 bg-transparent text-ink-primary text-xs outline-none placeholder:text-ink-faint"
          />
          <button
            type="button"
            onClick={onClose}
            className="text-ink-faint hover:text-ink-primary p-1 rounded-md hover:bg-surface-hover transition-colors"
            aria-label="Close user picker"
          >
            <X size={15} />
          </button>
        </div>

        <div className="overflow-y-auto flex-1 divide-y divide-border-subtle">
          {filteredUsers.length === 0 ? (
            <div className="p-6 text-center text-xs text-ink-muted">
              No matching teammates found.
            </div>
          ) : (
            filteredUsers.map((u) => (
              <button
                key={u.id}
                type="button"
                onClick={() => handleSelectUser(u)}
                className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-surface-hover text-left transition-colors"
              >
                <UserAvatar user={u} size="md" showStatus />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-ink-primary truncate">
                    {u.display_name || u.username}
                  </p>
                  <p className="text-[11px] text-ink-faint font-mono truncate">
                    @{u.username}
                  </p>
                </div>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default UserPickerModal;
