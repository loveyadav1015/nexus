import { useState } from 'react';
import { format } from 'date-fns';
import { SmilePlus, MessageSquare, Pencil, Trash2 } from 'lucide-react';
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
    status: message.status,
  };

  const timestamp = format(new Date(message.created_at), 'h:mm a');

  const handleEdit = async () => {
    if (!editContent.trim()) return;
    try {
      await editMessageApi(message.id, editContent.trim());
      setIsEditing(false);
      toast.success('Message edited');
    } catch (err) {
      toast.error('Failed to edit message');
    }
  };

  const handleDelete = async () => {
    try {
      await deleteMessageApi(message.id);
      setShowDeleteConfirm(false);
      toast.success('Message deleted');
    } catch (err) {
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
      <div className="flex gap-3 px-4 py-1">
        <UserAvatar user={user} size="md" />
        <div>
          <div className="flex items-baseline gap-2">
            <span className="font-semibold text-white text-sm">{message.display_name || message.username}</span>
            <span className="text-[11px] text-gray-500 ml-1">{timestamp}</span>
          </div>
          <p className="text-sm text-gray-500 italic mt-0.5">This message was deleted</p>
        </div>
      </div>
    );
  }

  return (
    <div className="message-group flex gap-3 px-4 py-1 hover:bg-[#27292d]/40 rounded relative group transition-colors">
      <UserAvatar user={user} size="md" />
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-2">
          <span className="font-semibold text-white text-sm">{message.display_name || message.username}</span>
          <span className="text-[11px] text-gray-500 ml-1">{timestamp}</span>
          {message.is_edited && <span className="text-[11px] text-gray-500 italic ml-1">(edited)</span>}
        </div>

        {isEditing ? (
          <div className="mt-1">
            <textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              className="w-full bg-[#2c2d30] border border-[#383a40] rounded-lg px-3 py-2 text-sm text-white resize-none outline-none focus:border-[#4a9eed]"
              rows={2}
            />
            <div className="flex gap-2 mt-1">
              <button
                onClick={handleEdit}
                className="text-xs bg-[#4a55c8] hover:bg-[#5561d4] text-white px-3 py-1 rounded transition-colors"
              >
                Save
              </button>
              <button
                onClick={() => { setIsEditing(false); setEditContent(message.content); }}
                className="text-xs text-gray-400 hover:text-white px-3 py-1 rounded transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <p className="text-sm text-[#d1d2d3] mt-0.5 leading-relaxed break-words">{message.content}</p>
        )}

        <ReactionBar reactions={message.reactions} messageId={message.id} channelId={channelId} />

        {showDeleteConfirm && (
          <div className="mt-2 p-2 bg-[#222529] border border-[#383a40] rounded-lg inline-flex items-center gap-2">
            <span className="text-sm text-gray-300">Delete this message?</span>
            <button
              onClick={handleDelete}
              className="text-xs bg-[#e8502a] hover:bg-red-600 text-white px-3 py-1 rounded transition-colors"
            >
              Delete
            </button>
            <button
              onClick={() => setShowDeleteConfirm(false)}
              className="text-xs text-gray-400 hover:text-white px-3 py-1 rounded transition-colors"
            >
              Cancel
            </button>
          </div>
        )}
      </div>

      {!isEditing && !isThread && (
        <div className="message-toolbar absolute top-0 right-4 -translate-y-1/2 bg-[#222529] border border-[#383a40] rounded-lg shadow-lg p-1 flex items-center gap-0.5 z-10">
          <button
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            className="p-1.5 rounded text-gray-400 hover:text-white hover:bg-[#27292d] cursor-pointer transition-colors"
            aria-label="Add reaction"
          >
            <SmilePlus size={16} />
          </button>
          <button
            onClick={() => setActiveThread(message)}
            className="p-1.5 rounded text-gray-400 hover:text-white hover:bg-[#27292d] cursor-pointer transition-colors"
            aria-label="Reply in thread"
          >
            <MessageSquare size={16} />
          </button>
          {isOwnMessage && (
            <>
              <button
                onClick={() => { setIsEditing(true); setEditContent(message.content); }}
                className="p-1.5 rounded text-gray-400 hover:text-white hover:bg-[#27292d] cursor-pointer transition-colors"
                aria-label="Edit message"
              >
                <Pencil size={16} />
              </button>
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="p-1.5 rounded text-gray-400 hover:text-white hover:bg-[#27292d] cursor-pointer transition-colors"
                aria-label="Delete message"
              >
                <Trash2 size={16} />
              </button>
            </>
          )}
        </div>
      )}

      {showEmojiPicker && (
        <div className="absolute right-4 top-8 z-20">
          <EmojiPicker
            onEmojiClick={handleEmojiSelect}
            theme="dark"
            width={300}
            height={350}
          />
        </div>
      )}
    </div>
  );
};

export default MessageItem;
