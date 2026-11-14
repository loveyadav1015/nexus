import { useState } from 'react';
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
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center" onClick={onClose}>
      <div
        className="bg-[#222529] rounded-xl w-[400px] shadow-2xl border border-[#383a40] max-h-[480px] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-2 px-4 py-3 border-b border-[#383a40]">
          <Search size={16} className="text-gray-400 flex-shrink-0" />
          <input
            type="text"
            placeholder="Search users..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 bg-transparent text-white text-sm outline-none placeholder-gray-500"
          />
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white"
            aria-label="Close"
          >
            <X size={16} />
          </button>
        </div>

        <div className="overflow-y-auto flex-1">
          {filteredUsers.map((u) => (
            <div
              key={u.id}
              onClick={() => handleSelectUser(u)}
              className="flex items-center gap-3 px-4 py-3 hover:bg-[#27292d] cursor-pointer transition-colors"
            >
              <UserAvatar user={u} size="md" showStatus />
              <div>
                <p className="text-sm font-medium text-white">{u.display_name || u.username}</p>
                <p className="text-xs text-gray-400">@{u.username}</p>
              </div>
            </div>
          ))}
          {filteredUsers.length === 0 && (
            <p className="px-4 py-8 text-center text-sm text-gray-500">No users found</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserPickerModal;
