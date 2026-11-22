import useAuthStore from '../../store/authStore';

const TypingIndicator = ({ typingUsers, channelId }) => {
  const currentUser = useAuthStore((s) => s.user);
  const channelTyping = typingUsers?.[channelId] || {};
  const typingNames = Object.entries(channelTyping)
    .filter(([userId]) => parseInt(userId, 10) !== currentUser?.id)
    .map(([, username]) => username);

  if (typingNames.length === 0) return <div className="h-5 px-5" />;

  const text = typingNames.length === 1
    ? `${typingNames[0]} is typing...`
    : `${typingNames.join(', ')} are typing...`;

  return (
    <div
      role="status"
      aria-live="polite"
      className="h-5 px-5 flex items-center gap-1.5 select-none"
    >
      <div className="flex gap-1 items-center">
        <span className="typing-dot w-1 h-1 bg-accent rounded-full" />
        <span className="typing-dot w-1 h-1 bg-accent rounded-full" />
        <span className="typing-dot w-1 h-1 bg-accent rounded-full" />
      </div>
      <span className="text-[11px] font-mono text-ink-muted">{text}</span>
    </div>
  );
};

export default TypingIndicator;
