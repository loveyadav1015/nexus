import useAuthStore from '../../store/authStore';

const TypingIndicator = ({ typingUsers, channelId }) => {
  const currentUser = useAuthStore((s) => s.user);
  const channelTyping = typingUsers?.[channelId] || {};
  const typingNames = Object.entries(channelTyping)
    .filter(([userId]) => parseInt(userId, 10) !== currentUser?.id)
    .map(([, username]) => username);

  if (typingNames.length === 0) return <div className="h-6 px-4" />;

  const text = typingNames.length === 1
    ? `${typingNames[0]} is typing`
    : `${typingNames.join(', ')} are typing`;

  return (
    <div className="h-6 px-4 flex items-center gap-1">
      <div className="flex gap-0.5">
        <span className="typing-dot w-1.5 h-1.5 bg-gray-400 rounded-full" />
        <span className="typing-dot w-1.5 h-1.5 bg-gray-400 rounded-full" />
        <span className="typing-dot w-1.5 h-1.5 bg-gray-400 rounded-full" />
      </div>
      <span className="text-xs text-gray-400 ml-1">{text}</span>
    </div>
  );
};

export default TypingIndicator;
