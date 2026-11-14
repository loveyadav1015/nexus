import { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import useChannelStore from '../store/channelStore';
import useUserStore from '../store/userStore';
import useDMStore from '../store/dmStore';
import { connectSocket } from '../services/socket';
import { getChannels } from '../api/channels';
import { getAllUsers } from '../api/users';
import useSocket from '../hooks/useSocket';
import Sidebar from '../components/sidebar/Sidebar';
import ChatArea from '../components/chat/ChatArea';
import DMArea from '../components/dm/DMArea';
import WelcomeScreen from '../components/chat/WelcomeScreen';

const Workspace = () => {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const token = useAuthStore((s) => s.token);
  const setChannels = useChannelStore((s) => s.setChannels);
  const activeChannelId = useChannelStore((s) => s.activeChannelId);
  const setUsers = useUserStore((s) => s.setUsers);
  const activeConversation = useDMStore((s) => s.activeConversation);
  const { typingUsers } = useSocket();

  useEffect(() => {
    if (!token) return;

    connectSocket(token);

    const fetchData = async () => {
      try {
        const [channelsRes, usersRes] = await Promise.all([
          getChannels(),
          getAllUsers(),
        ]);
        setChannels(channelsRes.data.channels);
        setUsers(usersRes.data.users);
      } catch (err) {
        console.error('Failed to fetch initial data:', err);
      }
    };

    fetchData();
  }, [token, setChannels, setUsers]);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      {activeChannelId ? (
        <ChatArea typingUsers={typingUsers} />
      ) : activeConversation ? (
        <DMArea />
      ) : (
        <WelcomeScreen />
      )}
    </div>
  );
};

export default Workspace;
