import { useState, useEffect, useRef } from 'react';
import { Info } from 'lucide-react';
import { format, isToday, isYesterday } from 'date-fns';
import UserAvatar from '../ui/UserAvatar';
import DMDetailsPanel from './DMDetailsPanel';
import useDMStore from '../../store/dmStore';
import useAuthStore from '../../store/authStore';
import useUserStore from '../../store/userStore';
import { getDMMessages, sendDMMessage } from '../../api/dms';
import { Smile, Send } from 'lucide-react';

const DMArea = () => {
  const activeConversation = useDMStore((s) => s.activeConversation);
  const dmMessages = useDMStore((s) => s.dmMessages);
  const setDMMessages = useDMStore((s) => s.setDMMessages);
  const currentUser = useAuthStore((s) => s.user);
  const onlineUsers = useUserStore((s) => s.onlineUsers);
  const [showDetails, setShowDetails] = useState(false);
  const [content, setContent] = useState('');
  const bottomRef = useRef(null);

  const otherUser = activeConversation?.otherUser;
  const conversationId = activeConversation?.id;
  const messages = dmMessages[conversationId] || [];

  useEffect(() => {
    if (!conversationId) return;
    const fetchMessages = async () => {
      try {
        const res = await getDMMessages(conversationId);
        setDMMessages(conversationId, res.data.messages);
      } catch (err) {
        console.error('Failed to fetch DM messages:', err);
      }
    };
    fetchMessages();
  }, [conversationId, setDMMessages]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!content.trim() || !otherUser) return;
    try {
      await sendDMMessage(conversationId, content.trim(), otherUser.id);
      setContent('');
    } catch (err) {
      console.error('Failed to send DM:', err);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!activeConversation) return null;

  const otherUserStatus = onlineUsers[otherUser?.id] || otherUser?.status || 'offline';
  const statusColors = { online: 'bg-[#2bac76]', away: 'bg-[#e8a723]', offline: 'bg-[#6b7280]' };

  const getDateLabel = (dateStr) => {
    const date = new Date(dateStr);
    if (isToday(date)) return 'Today';
    if (isYesterday(date)) return 'Yesterday';
    return format(date, 'EEE, MMM d');
  };

  return (
    <div className="flex flex-row flex-1 overflow-hidden">
      <div className="flex flex-col flex-1 overflow-hidden bg-[#1d1c1d]">
        <div className="h-14 border-b border-[#383a40] flex items-center px-4 gap-3 flex-shrink-0">
          <UserAvatar user={{ ...otherUser, status: otherUserStatus }} size="md" showStatus />
          <span className="font-semibold text-white text-base">{otherUser?.display_name || otherUser?.username}</span>
          <span className={`w-2 h-2 rounded-full ${statusColors[otherUserStatus]}`} />
          <div className="flex-1" />
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="p-1.5 rounded text-gray-400 hover:text-white hover:bg-[#27292d] cursor-pointer transition-colors"
            aria-label="User details"
          >
            <Info size={16} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-2">
          {messages.map((msg, idx) => {
            const isMe = msg.sender_id === currentUser?.id;
            const sender = isMe ? currentUser : otherUser;
            const dateLabel = getDateLabel(msg.created_at);
            const prevMsg = messages[idx - 1];
            const showDateDivider = !prevMsg || getDateLabel(prevMsg.created_at) !== dateLabel;

            return (
              <div key={msg.id}>
                {showDateDivider && (
                  <div className="flex items-center gap-3 my-3">
                    <div className="flex-1 h-px bg-[#383a40]" />
                    <span className="text-[11px] text-gray-500 font-medium px-2">{dateLabel}</span>
                    <div className="flex-1 h-px bg-[#383a40]" />
                  </div>
                )}
                <div className={`flex gap-3 py-1 ${isMe ? 'flex-row-reverse' : ''}`}>
                  <UserAvatar user={{ ...sender, status: isMe ? currentUser.status : otherUserStatus }} size="md" />
                  <div className={`max-w-[70%] ${isMe ? 'bg-[#27292d] rounded-lg px-3 py-2' : ''}`}>
                    <div className={`flex items-baseline gap-2 ${isMe ? 'flex-row-reverse' : ''}`}>
                      <span className="font-semibold text-white text-sm">
                        {isMe ? 'Me' : (sender?.display_name || sender?.username)}
                      </span>
                      <span className="text-[11px] text-gray-500">{format(new Date(msg.created_at), 'h:mm a')}</span>
                    </div>
                    <p className="text-sm text-[#d1d2d3] mt-0.5 leading-relaxed">{msg.content}</p>
                  </div>
                </div>
              </div>
            );
          })}
          <div ref={bottomRef} />
        </div>

        <div className="px-4 pb-4 pt-0">
          <div className="border border-[#383a40] rounded-lg bg-[#2c2d30] overflow-hidden">
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={`Message ${otherUser?.display_name || otherUser?.username}`}
              rows={1}
              className="w-full bg-transparent px-4 pt-3 pb-2 text-sm text-[#d1d2d3] placeholder-gray-500 resize-none outline-none min-h-[44px] max-h-[200px]"
            />
            <div className="border-t border-[#383a40]/50 px-2 py-1.5 flex items-center justify-between">
              <button className="text-gray-400 hover:text-gray-200 p-1 rounded hover:bg-[#383a40] transition-colors" aria-label="Emoji">
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
        </div>
      </div>

      {showDetails && <DMDetailsPanel user={otherUser} />}
    </div>
  );
};

export default DMArea;
