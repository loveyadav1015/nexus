import { useRef, useEffect } from 'react';
import { format, isToday, isYesterday } from 'date-fns';
import MessageItem from './MessageItem';

const MessageList = ({ messages, loading, channelId }) => {
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

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

  if (loading) {
    return (
      <div className="flex-1 overflow-y-auto px-5 py-3 space-y-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="flex gap-3 animate-pulse">
            <div className="w-8 h-8 rounded-full bg-surface border border-border-subtle flex-shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-3 bg-surface border border-border-subtle rounded w-28" />
              <div className="h-3 bg-surface border border-border-subtle rounded w-3/4" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
        <p className="text-sm font-medium text-ink-primary">No messages yet.</p>
        <p className="text-xs text-ink-muted mt-1 max-w-xs">
          Say hello to start the conversation in this channel.
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto px-5 py-3 space-y-2">
      {groupedMessages.map((item) => {
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
        return (
          <MessageItem key={item.key} message={item.data} channelId={channelId} />
        );
      })}
      <div ref={bottomRef} />
    </div>
  );
};

export default MessageList;
