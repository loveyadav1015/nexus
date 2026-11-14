import { useState } from 'react';
import { Plus } from 'lucide-react';
import useChannelStore from '../../store/channelStore';
import useMessageStore from '../../store/messageStore';
import useDMStore from '../../store/dmStore';
import { markChannelRead } from '../../api/channels';
import { getSocket } from '../../services/socket';
import CreateChannelModal from './CreateChannelModal';

const ChannelList = () => {
  const channels = useChannelStore((s) => s.channels);
  const activeChannelId = useChannelStore((s) => s.activeChannelId);
  const setActiveChannel = useChannelStore((s) => s.setActiveChannel);
  const clearUnread = useChannelStore((s) => s.clearUnread);
  const unreadCounts = useChannelStore((s) => s.unreadCounts);
  const clearActiveThread = useMessageStore((s) => s.clearActiveThread);
  const setActiveConversation = useDMStore((s) => s.setActiveConversation);
  const [showModal, setShowModal] = useState(false);

  const handleSelectChannel = async (channelId) => {
    if (activeChannelId) {
      const socket = getSocket();
      if (socket) socket.emit('leave_channel', { channelId: activeChannelId });
    }

    setActiveChannel(channelId);
    setActiveConversation(null);
    clearActiveThread();
    clearUnread(channelId);

    const socket = getSocket();
    if (socket) {
      socket.emit('join_channel', { channelId });
      socket.emit('mark_read', { channelId });
    }

    try {
      await markChannelRead(channelId);
    } catch (err) {
      console.error('Failed to mark channel read:', err);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between px-3 mt-4 mb-1">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">
          Channels
        </span>
        <button
          onClick={() => setShowModal(true)}
          className="text-gray-400 hover:text-white cursor-pointer w-4 h-4 flex items-center justify-center"
          aria-label="Create channel"
        >
          <Plus size={14} />
        </button>
      </div>

      {channels.map((channel) => {
        const isActive = channel.id === activeChannelId;
        const unread = unreadCounts[channel.id] || 0;
        return (
          <div
            key={channel.id}
            onClick={() => handleSelectChannel(channel.id)}
            className={`flex items-center gap-2 px-3 py-1 mx-2 rounded text-sm cursor-pointer transition-colors ${
              isActive
                ? 'bg-[#1164a3] text-white'
                : 'text-gray-300 hover:bg-[#27292d]'
            }`}
          >
            <span className="text-gray-400">#</span>
            <span className="flex-1 truncate">{channel.name}</span>
            {unread > 0 && !isActive && (
              <span className="ml-auto bg-white text-[#19171d] text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
                {unread}
              </span>
            )}
          </div>
        );
      })}

      <CreateChannelModal isOpen={showModal} onClose={() => setShowModal(false)} />
    </div>
  );
};

export default ChannelList;
