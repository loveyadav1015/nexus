import { useState, useEffect, useRef } from 'react';
import { Info, Send, Menu } from 'lucide-react';
import { format, isToday, isYesterday } from 'date-fns';
import UserAvatar from '../ui/UserAvatar';
import DMDetailsPanel from './DMDetailsPanel';
import useDMStore from '../../store/dmStore';
import useAuthStore from '../../store/authStore';
import useUserStore from '../../store/userStore';
import { getDMMessages, sendDMMessage } from '../../api/dms';

const DMArea = ({ onToggleSidebar }) => {
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
  }, [messages.length]);

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
  const statusConfig = {
    online: { dot: 'bg-status-online', text: 'Online' },
    away: { dot: 'bg-status-away', text: 'Away' },
    offline: { dot: 'bg-status-offline', text: 'Offline' }
  };
  const config = statusConfig[otherUserStatus] || statusConfig.offline;

  const getDateLabel = (dateStr) => {
    const date = new Date(dateStr);
    if (isToday(date)) return 'Today';
    if (isYesterday(date)) return 'Yesterday';
    return format(date, 'EEEE, MMMM d');
  };

  const groupedMessages = [];
  let lastDate = null;
  messages.forEach((msg) => {
    const dateLabel = getDateLabel(msg.created_at);
    if (dateLabel !== lastDate) {
      groupedMessages.push({ type: 'divider', label: dateLabel, key: `divider-${msg.id}` });
      lastDate = dateLabel;
    }
    groupedMessages.push({ type: 'message', data: msg, key: `msg-${msg.id}` });
  });

  return (
    <main className="flex flex-row flex-1 overflow-hidden bg-canvas">
      <div className="flex flex-col flex-1 overflow-hidden min-w-0">
        {/* DM Header */}
        <header className="h-header border-b border-border-subtle flex items-center px-4 sm:px-5 gap-2.5 sm:gap-3 bg-canvas/80 backdrop-blur-xs flex-shrink-0 z-10">
          {onToggleSidebar && (
            <button
              type="button"
              onClick={onToggleSidebar}
              className="md:hidden p-1.5 -ml-1 rounded-md text-ink-secondary hover:text-ink-primary hover:bg-surface-hover transition-colors flex-shrink-0"
              aria-label="Toggle channels sidebar"
              title="Toggle channels sidebar"
            >
              <Menu size={16} />
            </button>
          )}
          <UserAvatar user={{ ...otherUser, status: otherUserStatus }} size="md" showStatus />
          <div className="flex-1 min-w-0">
            <h2 className="text-sm font-semibold text-ink-primary tracking-tight truncate leading-tight">
              {otherUser?.display_name || otherUser?.username}
            </h2>
            <div className="flex items-center gap-1.5 leading-tight">
              <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
              <span className="text-[11px] text-ink-muted capitalize">{config.text}</span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setShowDetails(!showDetails)}
            className="p-1.5 rounded-md text-ink-muted hover:text-ink-primary hover:bg-surface-hover transition-colors"
            aria-label="Toggle user details"
            title="User details"
          >
            <Info size={16} />
          </button>
        </header>

        {/* Message Stream */}
        <div className="flex-1 overflow-y-auto px-5 py-3 space-y-2">
          {messages.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center h-full">
              <UserAvatar user={{ ...otherUser, status: otherUserStatus }} size="lg" />
              <h3 className="text-sm font-semibold text-ink-primary mt-3">
                {otherUser?.display_name || otherUser?.username}
              </h3>
              <p className="text-xs text-ink-muted mt-1 max-w-xs">
                This is the beginning of your direct message history with @{otherUser?.username}.
              </p>
            </div>
          ) : (
            groupedMessages.map((item) => {
              if (item.type === 'divider') {
                return (
                  <div key={item.key} className="flex items-center gap-3 my-4">
                    <div className="flex-1 h-px bg-border-subtle" />
                    <span className="text-[11px] font-mono text-ink-muted font-medium px-2 select-none">
                      {item.label}
                    </span>
                    <div className="flex-1 h-px bg-border-subtle" />
                  </div>
                );
              }

              const msg = item.data;
              const isSender = msg.sender_id === currentUser?.id;
              const senderUser = isSender
                ? currentUser
                : { ...otherUser, id: msg.sender_id, username: msg.username, avatar_url: msg.avatar_url };

              return (
                <div key={item.key} className="flex gap-3 px-3 py-1.5 rounded-lg hover:bg-surface-hover/70 transition-colors">
                  <UserAvatar user={senderUser} size="md" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-2">
                      <span className="font-semibold text-xs text-ink-primary">
                        {senderUser?.display_name || senderUser?.username}
                      </span>
                      <span className="text-[10px] font-mono text-ink-faint select-none">
                        {format(new Date(msg.created_at), 'HH:mm')}
                      </span>
                    </div>
                    <p className="text-xs text-ink-primary whitespace-pre-wrap break-words leading-relaxed mt-0.5">
                      {msg.content}
                    </p>
                  </div>
                </div>
              );
            })
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="px-4 pb-4 pt-1">
          <div className="border border-border-strong rounded-xl bg-surface focus-within:border-accent focus-within:ring-1 focus-within:ring-accent transition-all shadow-xs overflow-hidden flex items-center pr-2">
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={`Message ${otherUser?.display_name || otherUser?.username || 'user'}`}
              rows={1}
              className="flex-1 bg-transparent px-4 py-2.5 text-sm text-ink-primary placeholder:text-ink-faint resize-none outline-none min-h-[44px]"
            />
            <button
              type="button"
              onClick={handleSend}
              disabled={!content.trim()}
              className="bg-accent hover:bg-accent-hover text-white rounded-md p-1.5 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-xs"
              aria-label="Send direct message"
            >
              <Send size={14} />
            </button>
          </div>
        </div>
      </div>

      {showDetails && (
        <DMDetailsPanel
          user={{ ...otherUser, status: otherUserStatus }}
          onClose={() => setShowDetails(false)}
        />
      )}
    </main>
  );
};

export default DMArea;
