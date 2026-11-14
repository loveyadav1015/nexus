import { useEffect } from 'react';
import { X } from 'lucide-react';
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
  }, [activeThread?.id, setThreadMessages]);

  if (!activeThread) return null;

  const parentUser = {
    id: activeThread.user_id,
    username: activeThread.username,
    display_name: activeThread.display_name,
    avatar_url: activeThread.avatar_url,
  };

  return (
    <div className="w-80 border-l border-[#383a40] bg-[#1d1c1d] flex flex-col h-full flex-shrink-0">
      <div className="h-14 border-b border-[#383a40] px-4 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-white">Thread</span>
          <span className="text-sm text-gray-400">{replies.length} {replies.length === 1 ? 'reply' : 'replies'}</span>
        </div>
        <button
          onClick={clearActiveThread}
          className="text-gray-400 hover:text-white p-1 rounded hover:bg-[#27292d] transition-colors"
          aria-label="Close thread"
        >
          <X size={18} />
        </button>
      </div>

      <div className="px-4 py-3 border-b border-[#383a40] flex-shrink-0">
        <div className="flex gap-3">
          <UserAvatar user={parentUser} size="md" />
          <div>
            <div className="flex items-baseline gap-2">
              <span className="font-semibold text-white text-sm">{activeThread.display_name || activeThread.username}</span>
              <span className="text-[11px] text-gray-500">{format(new Date(activeThread.created_at), 'h:mm a')}</span>
            </div>
            <p className="text-sm text-[#d1d2d3] mt-0.5 leading-relaxed">{activeThread.content}</p>
          </div>
        </div>
      </div>

      {replies.length > 0 && (
        <div className="flex items-center gap-2 px-4 py-2 flex-shrink-0">
          <div className="flex-1 h-px bg-[#383a40]" />
          <span className="text-xs text-gray-500">{replies.length} {replies.length === 1 ? 'reply' : 'replies'}</span>
          <div className="flex-1 h-px bg-[#383a40]" />
        </div>
      )}

      <div className="flex-1 overflow-y-auto">
        {replies.map((reply) => (
          <MessageItem
            key={reply.id}
            message={reply}
            channelId={activeThread.channel_id}
            isThread
          />
        ))}
      </div>

      <MessageInput
        channelId={activeThread.channel_id}
        parentId={activeThread.id}
        placeholder="Reply to thread..."
      />
    </div>
  );
};

export default ThreadPanel;
