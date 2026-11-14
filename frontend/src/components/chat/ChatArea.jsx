import ChatHeader from './ChatHeader';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import TypingIndicator from './TypingIndicator';
import ThreadPanel from './ThreadPanel';
import useChannelStore from '../../store/channelStore';
import useMessageStore from '../../store/messageStore';
import useMessages from '../../hooks/useMessages';

const ChatArea = ({ typingUsers }) => {
  const activeChannelId = useChannelStore((s) => s.activeChannelId);
  const channels = useChannelStore((s) => s.channels);
  const activeThread = useMessageStore((s) => s.activeThread);
  const { messages, loading } = useMessages(activeChannelId);

  const activeChannel = channels.find((c) => c.id === activeChannelId);

  if (!activeChannelId) return null;

  return (
    <div className="flex flex-row flex-1 overflow-hidden">
      <div className="flex flex-col flex-1 overflow-hidden bg-[#1d1c1d]">
        <ChatHeader channel={activeChannel} />
        <MessageList messages={messages} loading={loading} channelId={activeChannelId} />
        <TypingIndicator typingUsers={typingUsers} channelId={activeChannelId} />
        <MessageInput channelId={activeChannelId} channelName={activeChannel?.name} />
      </div>
      {activeThread && <ThreadPanel />}
    </div>
  );
};

export default ChatArea;
