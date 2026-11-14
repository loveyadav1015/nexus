import { useState } from 'react';
import { Bell, Settings } from 'lucide-react';
import ChannelList from './ChannelList';
import DMList from './DMList';
import UserAvatar from '../ui/UserAvatar';
import useAuthStore from '../../store/authStore';
import UserProfileModal from '../profile/UserProfileModal';

const Sidebar = () => {
  const user = useAuthStore((s) => s.user);
  const [showProfileModal, setShowProfileModal] = useState(false);

  return (
    <div className="w-[260px] h-screen bg-[#19171d] flex flex-col flex-shrink-0">
      <div className="h-14 flex items-center px-4 border-b border-[#383a40]">
        <div className="flex items-center gap-2 flex-1">
          <div className="bg-[#4a55c8] rounded-full w-6 h-6 flex items-center justify-center">
            <span className="text-white font-bold text-[10px]">S</span>
          </div>
          <span className="font-bold text-white text-sm">Mini Slack</span>
        </div>
        <button
          className="text-gray-400 hover:text-white p-1 rounded hover:bg-[#27292d] transition-colors"
          aria-label="Notifications"
        >
          <Bell size={16} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        <ChannelList />
        <DMList />
      </div>

      <div className="border-t border-[#383a40] p-3 mt-auto">
        <div className="flex items-center gap-2">
          <UserAvatar user={user} size="md" showStatus />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">
              {user?.display_name || user?.username}
            </p>
            <p className="text-xs text-gray-400 truncate">@{user?.username}</p>
          </div>
          <button
            onClick={() => setShowProfileModal(true)}
            className="ml-auto text-gray-400 hover:text-white p-1 rounded hover:bg-[#27292d] transition-colors"
            aria-label="Settings"
          >
            <Settings size={16} />
          </button>
        </div>
      </div>

      <UserProfileModal
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
      />
    </div>
  );
};

export default Sidebar;
