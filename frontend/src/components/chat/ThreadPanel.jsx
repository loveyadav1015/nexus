import { useEffect } from 'react';
import { X, MessageSquare } from 'lucide-react';
import useMessageStore from '../../store/messageStore';
import { getReplies } from '../../api/messages';
import MessageItem from './MessageItem';
import MessageInput from './MessageInput';
import UserAvatar from '../ui/UserAvatar';
import { format } from 'date-fns';

const ThreadPanel = () => {
  const activeThread = useMessageStore((s) => s.activeThread);
  const clearActiveThread = useMessageStore((s) => s.clearActiveThread);
  const threads = useMessageStore((s) => s.threads);
  const setThreadMessages = useMessageStore((s) => s.setThreadMessages);

  const replies = threads[activeThread?.id] || [];

  useEffect(() => {
    if (!activeThread) return;
    const fetchReplies = async () => {
      try {
        const res = await getReplies(activeThread.id);
        setThreadMessages(activeThread.id, res.data.replies);
      } catch (err) {
        console.error('Failed to fetch replies:', err);
      }
    };
    fetchReplies();
  }, [activeThread, setThreadMessages]);

  if (!activeThread) return null;

  const parentUser = {
    id: activeThread.user_id,
    username: activeThread.username,
    display_name: activeThread.display_name,
    avatar_url: activeThread.avatar_url,
    status: activeThread.status
  };

  return (
    <aside
      aria-label="Discussion thread"
      className="w-panel border-l border-border-subtle bg-surface flex flex-col h-full flex-shrink-0 animate-in slide-in-from-right-4 duration-150"
    >
      {/* Thread Header */}
      <div className="h-header border-b border-border-subtle px-4 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-2">
          <MessageSquare size={15} className="text-accent" />
          <span className="font-semibold text-ink-primary text-xs tracking-tight">Thread</span>
          <span className="text-[11px] font-mono text-ink-muted">
            ({replies.length} {replies.length === 1 ? 'reply' : 'replies'})
          </span>
        </div>
        <button
          type="button"
          onClick={clearActiveThread}
          className="text-ink-faint hover:text-ink-primary p-1 rounded-md hover:bg-surface-hover transition-colors"
          aria-label="Close thread panel"
        >
          <X size={15} />
        </button>
      </div>

      {/* Parent Anchor Message */}
      <div className="p-4 border-b border-border-subtle bg-canvas/40 flex-shrink-0">
        <div className="flex gap-3">
          <UserAvatar user={parentUser} size="md" />
          <div className="flex-1 min-w-0">
            <div className="flex items-baseline gap-2">
              <span className="font-semibold text-xs text-ink-primary">
                {activeThread.display_name || activeThread.username}
              </span>
              <span className="text-[10px] font-mono text-ink-faint">
                {format(new Date(activeThread.created_at), 'HH:mm')}
              </span>
            </div>
            <p className="text-xs text-ink-primary mt-1 leading-relaxed whitespace-pre-wrap break-words">
              {activeThread.content}
            </p>
          </div>
        </div>
      </div>

      {/* Replies Stream */}
      <div className="flex-1 overflow-y-auto px-3 py-2 space-y-2">
        {replies.length === 0 ? (
          <div className="p-6 text-center text-xs text-ink-muted">
            No replies yet. Start the thread below.
          </div>
        ) : (
          replies.map((reply) => (
            <MessageItem
              key={reply.id}
              message={reply}
              channelId={activeThread.channel_id}
              isThread
            />
          ))
        )}
      </div>

      {/* Reply Input */}
      <div className="p-3 border-t border-border-subtle bg-surface">
        <MessageInput
          channelId={activeThread.channel_id}
          parentId={activeThread.id}
          placeholder="Reply in thread..."
        />
      </div>
    </aside>
  );
};

export default ThreadPanel;
