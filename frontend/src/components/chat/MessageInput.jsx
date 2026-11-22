import { useState, useRef, useCallback } from 'react';
import { Smile, Send } from 'lucide-react';
import { sendMessage } from '../../api/messages';
import { getSocket } from '../../services/socket';
import EmojiPicker from 'emoji-picker-react';
import useSpeechToText from '../../hooks/useSpeechToText';
import MicButton from './MicButton';

const MessageInput = ({ channelId, channelName, parentId = null, placeholder: customPlaceholder }) => {
  const [content, setContent] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const typingTimeoutRef = useRef(null);
  const isTypingRef = useRef(false);
  const baseContentRef = useRef('');

  // Speech to text integration
  const { supported, listening, error: sttError, start: startListening, stop: stopListening } = useSpeechToText({
    lang: 'en-IN',
    continuous: true,
    interimResults: true,
    onTranscript: (spokenText) => {
      const base = baseContentRef.current;
      const separator = base && !base.endsWith(' ') ? ' ' : '';
      setContent(base ? `${base}${separator}${spokenText}` : spokenText);
    }
  });

  const handleToggleMic = () => {
    if (listening) {
      stopListening();
    } else {
      baseContentRef.current = content;
      startListening();
    }
  };

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
    if (listening) {
      stopListening();
    }
    try {
      await sendMessage(channelId, content.trim(), parentId);
      setContent('');
      baseContentRef.current = '';
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

  const isDarkMode = typeof document !== 'undefined' && document.documentElement.classList.contains('dark');

  return (
    <div className="px-4 pb-4 pt-1 relative">
      <div className="border border-border-strong rounded-xl bg-surface focus-within:border-accent focus-within:ring-1 focus-within:ring-accent transition-all shadow-xs overflow-hidden">
        <textarea
          value={content}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholderText}
          rows={1}
          className="w-full bg-transparent px-4 pt-3 pb-2 text-sm text-ink-primary placeholder:text-ink-faint resize-none outline-none min-h-[44px] max-h-[180px]"
          style={{ overflow: content.split('\n').length > 5 ? 'auto' : 'hidden' }}
        />
        <div className="border-t border-border-subtle px-2.5 py-1.5 flex items-center justify-between bg-surface/50">
          <button
            type="button"
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            className="text-ink-muted hover:text-ink-primary p-1 rounded-md hover:bg-surface-hover transition-colors"
            aria-label="Add emoji"
            title="Add emoji"
          >
            <Smile size={16} />
          </button>
          <div className="flex items-center gap-1">
            <MicButton
              supported={supported}
              listening={listening}
              onToggle={handleToggleMic}
              error={sttError}
            />
            <button
              type="button"
              onClick={handleSend}
              disabled={!content.trim()}
              className="bg-accent hover:bg-accent-hover text-white rounded-md p-1.5 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-xs"
              aria-label="Send message"
              title="Send message (Enter)"
            >
              <Send size={14} />
            </button>
          </div>
        </div>
      </div>

      {showEmojiPicker && (
        <div className="absolute bottom-full left-4 mb-2 z-20 shadow-xl border border-border-strong rounded-lg overflow-hidden">
          <EmojiPicker
            onEmojiClick={handleEmojiSelect}
            theme={isDarkMode ? 'dark' : 'light'}
            width={320}
            height={360}
          />
        </div>
      )}
    </div>
  );
};

export default MessageInput;
