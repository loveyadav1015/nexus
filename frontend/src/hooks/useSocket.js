import { useEffect, useState, useCallback } from 'react';
import { getSocket } from '../services/socket';
import useMessageStore from '../store/messageStore';
import useChannelStore from '../store/channelStore';
import useUserStore from '../store/userStore';
import useDMStore from '../store/dmStore';
import useAuthStore from '../store/authStore';

const useSocket = () => {
  const [typingUsers, setTypingUsers] = useState({});
  const addMessage = useMessageStore((s) => s.addMessage);
  const deleteMessage = useMessageStore((s) => s.deleteMessage);
  const editMessage = useMessageStore((s) => s.editMessage);
  const addReaction = useMessageStore((s) => s.addReaction);
  const removeReaction = useMessageStore((s) => s.removeReaction);
  const addThreadMessage = useMessageStore((s) => s.addThreadMessage);
  const activeThread = useMessageStore((s) => s.activeThread);
  const incrementUnread = useChannelStore((s) => s.incrementUnread);
  const activeChannelId = useChannelStore((s) => s.activeChannelId);
  const updateUserStatus = useUserStore((s) => s.updateUserStatus);
  const addDMMessage = useDMStore((s) => s.addDMMessage);
  const user = useAuthStore((s) => s.user);

  const clearTyping = useCallback((channelId, userId) => {
    setTypingUsers((prev) => {
      const channelTyping = { ...(prev[channelId] || {}) };
      delete channelTyping[userId];
      return { ...prev, [channelId]: channelTyping };
    });
  }, []);

  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    const handleNewMessage = (message) => {
      const channelId = message.channel_id;
      if (message.parent_id) {
        addThreadMessage(message.parent_id, message);
      } else {
        addMessage(channelId, message);
        if (channelId !== activeChannelId && message.user_id !== user?.id) {
          incrementUnread(channelId);
        }
      }
    };

    const handleMessageDeleted = ({ messageId, channelId }) => {
      deleteMessage(channelId, messageId);
    };

    const handleMessageEdited = (message) => {
      editMessage(message.channel_id, message);
    };

    const handleReactionAdded = ({ messageId, channelId, userId, emoji, id }) => {
      addReaction(channelId, messageId, { userId, emoji, id });
    };

    const handleReactionRemoved = ({ messageId, channelId, userId, emoji }) => {
      removeReaction(channelId, messageId, userId, emoji);
    };

    const handleUserStatusChange = ({ userId, status }) => {
      updateUserStatus(userId, status);
    };

    const handleUserTyping = ({ userId, username, channelId }) => {
      setTypingUsers((prev) => ({
        ...prev,
        [channelId]: { ...(prev[channelId] || {}), [userId]: username },
      }));
      setTimeout(() => clearTyping(channelId, userId), 3000);
    };

    const handleUserStopTyping = ({ channelId, userId }) => {
      if (userId) {
        clearTyping(channelId, userId);
      }
    };

    const handleNewDM = ({ conversationId, message }) => {
      addDMMessage(conversationId, message);
    };

    socket.on('new_message', handleNewMessage);
    socket.on('message_deleted', handleMessageDeleted);
    socket.on('message_edited', handleMessageEdited);
    socket.on('reaction_added', handleReactionAdded);
    socket.on('reaction_removed', handleReactionRemoved);
    socket.on('user_status_change', handleUserStatusChange);
    socket.on('user_typing', handleUserTyping);
    socket.on('user_stop_typing', handleUserStopTyping);
    socket.on('new_dm', handleNewDM);

    return () => {
      socket.off('new_message', handleNewMessage);
      socket.off('message_deleted', handleMessageDeleted);
      socket.off('message_edited', handleMessageEdited);
      socket.off('reaction_added', handleReactionAdded);
      socket.off('reaction_removed', handleReactionRemoved);
      socket.off('user_status_change', handleUserStatusChange);
      socket.off('user_typing', handleUserTyping);
      socket.off('user_stop_typing', handleUserStopTyping);
      socket.off('new_dm', handleNewDM);
    };
  }, [activeChannelId, activeThread, user?.id, addMessage, deleteMessage, editMessage, addReaction, removeReaction, addThreadMessage, incrementUnread, updateUserStatus, addDMMessage, clearTyping]);

  return { typingUsers };
};

export default useSocket;
