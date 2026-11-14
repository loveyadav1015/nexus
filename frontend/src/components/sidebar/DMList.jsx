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

  const statusColors = {
    online: 'bg-[#2bac76]',
    away: 'bg-[#e8a723]',
    offline: 'bg-[#6b7280]',
  };

  return (
    <div>
      <div className="flex items-center justify-between px-3 mt-4 mb-1">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">
          Direct Messages
        </span>
        <button
          onClick={() => setShowUserPicker(true)}
          className="text-gray-400 hover:text-white cursor-pointer w-4 h-4 flex items-center justify-center"
          aria-label="New direct message"
        >
          <Plus size={14} />
        </button>
      </div>

      {otherUsers.map((u) => {
        const status = onlineUsers[u.id] || u.status || 'offline';
        const isActive = activeConversation?.otherUser?.id === u.id;
        return (
          <div
            key={u.id}
            onClick={() => handleSelectDM(u)}
            className={`flex items-center gap-2 px-3 py-1 mx-2 rounded text-sm cursor-pointer transition-colors ${
              isActive
                ? 'bg-[#1164a3] text-white'
                : 'text-gray-300 hover:bg-[#27292d]'
            }`}
          >
            <span className={`w-2 h-2 rounded-full flex-shrink-0 ${statusColors[status]}`} />
            <span className="truncate">{u.display_name || u.username}</span>
          </div>
        );
      })}

      <UserPickerModal
        isOpen={showUserPicker}
        onClose={() => setShowUserPicker(false)}
      />
    </div>
  );
};

export default DMList;
