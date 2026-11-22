import { useState } from 'react';
import { format } from 'date-fns';
import { SmilePlus, MessageSquare, Pencil, Trash2, Check, X } from 'lucide-react';
import UserAvatar from '../ui/UserAvatar';
import ReactionBar from './ReactionBar';
import useAuthStore from '../../store/authStore';
import useMessageStore from '../../store/messageStore';
import { editMessage as editMessageApi, deleteMessage as deleteMessageApi } from '../../api/messages';
import toast from 'react-hot-toast';
import EmojiPicker from 'emoji-picker-react';
import { addReaction } from '../../api/reactions';

const MessageItem = ({ message, channelId, isThread = false }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(message.content);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const currentUser = useAuthStore((s) => s.user);
  const setActiveThread = useMessageStore((s) => s.setActiveThread);
  const isOwnMessage = currentUser?.id === message.user_id;

  const user = {
    id: message.user_id,
    username: message.username,
    display_name: message.display_name,
    avatar_url: message.avatar_url,
    status: message.status
  };

  const timestamp = format(new Date(message.created_at), 'HH:mm');
  const fullDate = format(new Date(message.created_at), 'yyyy-MM-dd HH:mm');
  const isDarkMode = typeof document !== 'undefined' && document.documentElement.classList.contains('dark');

  const handleEdit = async () => {
    if (!editContent.trim()) return;
    try {
      await editMessageApi(message.id, editContent.trim());
      setIsEditing(false);
      toast.success('Message updated');
    } catch {
      toast.error('Failed to update message');
    }
  };

  const handleDelete = async () => {
    try {
      await deleteMessageApi(message.id);
      setShowDeleteConfirm(false);
      toast.success('Message deleted');
    } catch {
      toast.error('Failed to delete message');
    }
  };

  const handleEmojiSelect = async (emojiData) => {
    try {
      await addReaction(message.id, emojiData.emoji);
      setShowEmojiPicker(false);
    } catch (err) {
      console.error('Failed to add reaction:', err);
    }
  };

  if (message.is_deleted) {
    return (
      <div className="flex gap-3 px-3 py-1.5 opacity-60">
        <UserAvatar user={user} size="sm" />
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-2">
            <span className="font-semibold text-xs text-ink-muted">
              {message.display_name || message.username}
            </span>
            <span className="text-[11px] font-mono text-ink-faint">{timestamp}</span>
          </div>
          <p className="text-xs text-ink-muted italic mt-0.5">This message was removed</p>
        </div>
      </div>
    );
  }

  return (
    <div className="message-group flex gap-3 px-3 py-1.5 rounded-lg hover:bg-surface-hover/70 relative group transition-colors">
      <UserAvatar user={user} size="md" />

      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-2">
          <span className="font-semibold text-xs text-ink-primary hover:underline cursor-pointer">
            {message.display_name || message.username}
          </span>
          <span
            title={fullDate}
            className="text-[10px] font-mono text-ink-faint select-none"
          >
            {timestamp}
          </span>
          {message.is_edited && (
            <span
              title="Edited"
              className="text-[10px] font-mono text-ink-muted select-none"
            >
              (edited)
            </span>
          )}
        </div>

        {isEditing ? (
          <div className="mt-1 space-y-2">
            <input
              type="text"
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleEdit();
                if (e.key === 'Escape') setIsEditing(false);
              }}
              autoFocus
              className="w-full bg-input border border-border-strong rounded-md px-3 py-1.5 text-xs text-ink-primary focus:outline-none focus:border-accent"
            />
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={handleEdit}
                className="flex items-center gap-1 bg-accent text-white px-2.5 py-1 rounded text-xs font-medium"
              >
                <Check size={12} /> Save
              </button>
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="flex items-center gap-1 border border-border-strong text-ink-secondary px-2.5 py-1 rounded text-xs"
              >
                <X size={12} /> Cancel
              </button>
            </div>
          </div>
        ) : (
          <p className="text-xs text-ink-primary whitespace-pre-wrap break-words leading-relaxed mt-0.5">
            {message.content}
          </p>
        )}

        {/* Reaction Bar */}
        <ReactionBar
          reactions={message.reactions}
          messageId={message.id}
          channelId={channelId}
        />

        {/* Thread replies button */}
        {!isThread && message.thread_count > 0 && (
          <button
            type="button"
            onClick={() => setActiveThread(message)}
            className="mt-1.5 flex items-center gap-1.5 text-xs font-semibold text-accent hover:underline"
          >
            <MessageSquare size={12} />
            <span>{message.thread_count} {message.thread_count === 1 ? 'reply' : 'replies'}</span>
          </button>
        )}
      </div>

      {/* Floating Action Toolbar on hover */}
      <div className="message-toolbar absolute right-3 -top-3 z-10 flex items-center bg-surface border border-border-strong rounded-md shadow-xs p-0.5">
        <button
          type="button"
          onClick={() => setShowEmojiPicker(!showEmojiPicker)}
          className="p-1 rounded text-ink-muted hover:text-ink-primary hover:bg-surface-hover transition-colors"
          title="Add reaction"
          aria-label="Add reaction"
        >
          <SmilePlus size={14} />
        </button>

        {!isThread && (
          <button
            type="button"
            onClick={() => setActiveThread(message)}
            className="p-1 rounded text-ink-muted hover:text-ink-primary hover:bg-surface-hover transition-colors"
            title="Reply in thread"
            aria-label="Reply in thread"
          >
            <MessageSquare size={14} />
          </button>
        )}

        {isOwnMessage && (
          <>
            <button
              type="button"
              onClick={() => setIsEditing(true)}
              className="p-1 rounded text-ink-muted hover:text-ink-primary hover:bg-surface-hover transition-colors"
              title="Edit message"
              aria-label="Edit message"
            >
              <Pencil size={14} />
            </button>
            <button
              type="button"
              onClick={() => setShowDeleteConfirm(true)}
              className="p-1 rounded text-ink-muted hover:text-danger hover:bg-surface-hover transition-colors"
              title="Delete message"
              aria-label="Delete message"
            >
              <Trash2 size={14} />
            </button>
          </>
        )}
      </div>

      {/* Emoji Picker Popover */}
      {showEmojiPicker && (
        <div className="absolute right-3 top-6 z-30 shadow-xl border border-border-strong rounded-lg overflow-hidden">
          <EmojiPicker
            onEmojiClick={handleEmojiSelect}
            theme={isDarkMode ? 'dark' : 'light'}
            width={300}
            height={340}
          />
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-surface border border-border-strong rounded-xl p-5 max-w-xs w-full shadow-xl">
            <h4 className="text-xs font-semibold text-ink-primary mb-1">Delete message?</h4>
            <p className="text-xs text-ink-muted mb-4">
              This cannot be undone. The message will be removed for everyone.
            </p>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(false)}
                className="px-3 py-1.5 rounded-lg border border-border-strong text-xs text-ink-secondary hover:bg-surface-hover"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                className="px-3 py-1.5 rounded-lg bg-danger hover:opacity-90 text-white text-xs font-semibold"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MessageItem;
