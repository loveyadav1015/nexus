import useAuthStore from '../../store/authStore';
import { addReaction, removeReaction } from '../../api/reactions';

const ReactionBar = ({ reactions, messageId }) => {
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
    <div className="flex flex-wrap gap-1 mt-1.5">
      {Object.values(grouped).map((r) => (
        <button
          key={r.emoji}
          type="button"
          onClick={() => handleToggleReaction(r.emoji, r.hasOwn)}
          className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-xs transition-all ${
            r.hasOwn
              ? 'border border-accent-border bg-accent-faint text-accent'
              : 'border border-border-strong bg-surface hover:bg-surface-hover text-ink-primary'
          }`}
          aria-label={`${r.emoji} ${r.count}`}
        >
          <span>{r.emoji}</span>
          <span className="text-[11px] font-mono font-medium">{r.count}</span>
        </button>
      ))}
    </div>
  );
};

export default ReactionBar;
