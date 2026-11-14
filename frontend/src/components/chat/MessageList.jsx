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
    return format(date, 'EEE, MMM d');
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
      <div className="flex-1 overflow-y-auto px-4 py-2">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex gap-3 px-4 py-3 animate-pulse">
            <div className="w-9 h-9 rounded-full bg-[#27292d] flex-shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-3 bg-[#27292d] rounded w-32" />
              <div className="h-3 bg-[#27292d] rounded w-64" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-gray-500 text-sm">No messages yet. Start the conversation!</p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto px-4 py-2">
      {groupedMessages.map((item) => {
        if (item.type === 'divider') {
          return (
            <div key={item.key} className="flex items-center gap-3 my-3">
              <div className="flex-1 h-px bg-[#383a40]" />
              <span className="text-[11px] text-gray-500 font-medium px-2">{item.label}</span>
              <div className="flex-1 h-px bg-[#383a40]" />
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
