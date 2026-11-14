import useAuthStore from '../../store/authStore';
import { addReaction, removeReaction } from '../../api/reactions';

const ReactionBar = ({ reactions, messageId, channelId }) => {
  const currentUser = useAuthStore((s) => s.user);

  if (!reactions || reactions.length === 0) return null;

  const grouped = {};
  reactions.forEach((r) => {
    if (!grouped[r.emoji]) {
      grouped[r.emoji] = { emoji: r.emoji, count: 0, users: [], hasOwn: false };
    }
    grouped[r.emoji].count += 1;
    grouped[r.emoji].users.push(r.user_id);
    if (r.user_id === currentUser?.id) {
      grouped[r.emoji].hasOwn = true;
    }
  });

  const handleToggleReaction = async (emoji, hasOwn) => {
    try {
      if (hasOwn) {
        await removeReaction(messageId, emoji);
      } else {
        await addReaction(messageId, emoji);
      }
    } catch (err) {
      console.error('Failed to toggle reaction:', err);
    }
  };

  return (
    <div className="flex flex-wrap gap-1 mt-1">
      {Object.values(grouped).map((r) => (
        <button
          key={r.emoji}
          onClick={() => handleToggleReaction(r.emoji, r.hasOwn)}
          className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-sm cursor-pointer transition-colors ${
            r.hasOwn
              ? 'border border-[#4a9eed] bg-[#4a9eed]/10 hover:bg-[#4a9eed]/20'
              : 'bg-[#27292d] border border-[#383a40] hover:bg-[#2c2d30]'
          }`}
          aria-label={`${r.emoji} ${r.count}`}
        >
          <span>{r.emoji}</span>
          <span className="text-xs text-gray-300">{r.count}</span>
        </button>
      ))}
    </div>
  );
};

export default ReactionBar;
