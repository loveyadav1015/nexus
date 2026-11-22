import { useState } from 'react';
import { Plus, Hash } from 'lucide-react';
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
      <div className="flex items-center justify-between px-2 mb-1.5">
        <span className="text-xs font-semibold text-ink-secondary">
          Channels
        </span>
        <button
          type="button"
          onClick={() => setShowModal(true)}
          className="text-ink-faint hover:text-ink-primary p-0.5 rounded hover:bg-surface-hover transition-colors"
          aria-label="Create channel"
          title="Create channel"
        >
          <Plus size={14} />
        </button>
      </div>

      <nav aria-label="Channels" className="space-y-0.5">
        {channels.map((channel) => {
          const isActive = channel.id === activeChannelId;
          const unread = unreadCounts[channel.id] || 0;
          return (
            <button
              key={channel.id}
              type="button"
              onClick={() => handleSelectChannel(channel.id)}
              className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-medium text-left transition-colors ${
                isActive
                  ? 'bg-surface text-accent font-semibold shadow-xs border border-border-strong'
                  : unread > 0
                  ? 'text-ink-primary font-semibold hover:bg-surface-hover'
                  : 'text-ink-secondary hover:text-ink-primary hover:bg-surface-hover'
              }`}
            >
              <Hash size={13} className={isActive ? 'text-accent' : 'text-ink-faint'} />
              <span className="flex-1 truncate">{channel.name}</span>
              {unread > 0 && !isActive && (
                <span
                  aria-label={`${unread} unread messages`}
                  className="bg-badge-bg border border-badge-border text-badge-text text-[10px] font-mono font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1"
                >
                  {unread}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      <CreateChannelModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
      />
    </div>
  );
};

export default ChannelList;
