import { useEffect, useState } from 'react';
import { getChannelMessages } from '../api/channels';
import useMessageStore from '../store/messageStore';

const useMessages = (channelId) => {
  const [loading, setLoading] = useState(false);
  const messages = useMessageStore((s) => s.messages[channelId]) || [];
  const setMessages = useMessageStore((s) => s.setMessages);

  useEffect(() => {
    if (!channelId) return;

    const fetchMessages = async () => {
      setLoading(true);
      try {
        const res = await getChannelMessages(channelId);
        setMessages(channelId, res.data.messages);
      } catch (error) {
        console.error('Failed to fetch messages:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
  }, [channelId, setMessages]);

  return { messages, loading };
};

export default useMessages;
