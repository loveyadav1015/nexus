import ChatHeader from './ChatHeader';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import TypingIndicator from './TypingIndicator';
import ThreadPanel from './ThreadPanel';
import useChannelStore from '../../store/channelStore';
import useMessageStore from '../../store/messageStore';
import useMessages from '../../hooks/useMessages';

const ChatArea = ({ typingUsers, onToggleSidebar }) => {
  const activeChannelId = useChannelStore((s) => s.activeChannelId);
  const channels = useChannelStore((s) => s.channels);
  const activeThread = useMessageStore((s) => s.activeThread);
  const { messages, loading } = useMessages(activeChannelId);

  const activeChannel = channels.find((c) => c.id === activeChannelId);

  if (!activeChannelId) return null;

  return (
    <main className="flex flex-row flex-1 overflow-hidden bg-canvas">
      <div className="flex flex-col flex-1 overflow-hidden min-w-0">
        <ChatHeader channel={activeChannel} onToggleSidebar={onToggleSidebar} />
        <MessageList messages={messages} loading={loading} channelId={activeChannelId} />
        <TypingIndicator typingUsers={typingUsers} channelId={activeChannelId} />
        <MessageInput channelId={activeChannelId} channelName={activeChannel?.name} />
      </div>
      {activeThread && <ThreadPanel />}
    </main>
  );
};

export default ChatArea;
