import { useState, useRef, useCallback } from 'react';
import { Smile, Send } from 'lucide-react';
import { sendMessage } from '../../api/messages';
import { getSocket } from '../../services/socket';
import EmojiPicker from 'emoji-picker-react';

const MessageInput = ({ channelId, channelName, parentId = null, placeholder: customPlaceholder }) => {
  const [content, setContent] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const typingTimeoutRef = useRef(null);
  const isTypingRef = useRef(false);

  const placeholderText = customPlaceholder || `Message #${channelName || ''}`;

  const emitTypingStart = useCallback(() => {
    if (isTypingRef.current) return;
    const socket = getSocket();
    if (socket) {
      socket.emit('typing_start', { channelId });
      isTypingRef.current = true;
    }
  }, [channelId]);

  const emitTypingStop = useCallback(() => {
    const socket = getSocket();
    if (socket) {
      socket.emit('typing_stop', { channelId });
      isTypingRef.current = false;
    }
  }, [channelId]);

  const handleChange = (e) => {
    setContent(e.target.value);
    emitTypingStart();
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      emitTypingStop();
    }, 1500);
  };

  const handleSend = async () => {
    if (!content.trim()) return;
    try {
      await sendMessage(channelId, content.trim(), parentId);
      setContent('');
      emitTypingStop();
    } catch (err) {
      console.error('Failed to send message:', err);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleEmojiSelect = (emojiData) => {
    setContent((prev) => prev + emojiData.emoji);
    setShowEmojiPicker(false);
  };

  return (
    <div className="px-4 pb-4 pt-0 relative">
      <div className="border border-[#383a40] rounded-lg bg-[#2c2d30] overflow-hidden">
        <textarea
          value={content}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholderText}
          rows={1}
          className="w-full bg-transparent px-4 pt-3 pb-2 text-sm text-[#d1d2d3] placeholder-gray-500 resize-none outline-none min-h-[44px] max-h-[200px]"
          style={{ overflow: content.split('\n').length > 6 ? 'auto' : 'hidden' }}
        />
        <div className="border-t border-[#383a40]/50 px-2 py-1.5 flex items-center justify-between">
          <button
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            className="text-gray-400 hover:text-gray-200 p-1 rounded hover:bg-[#383a40] transition-colors"
            aria-label="Emoji picker"
          >
            <Smile size={18} />
          </button>
          <button
            onClick={handleSend}
            disabled={!content.trim()}
            className="bg-[#4a55c8] hover:bg-[#5561d4] text-white rounded p-1.5 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            aria-label="Send message"
          >
            <Send size={16} />
          </button>
        </div>
      </div>

      {showEmojiPicker && (
        <div className="absolute bottom-full left-4 mb-2 z-20">
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

export default MessageInput;
