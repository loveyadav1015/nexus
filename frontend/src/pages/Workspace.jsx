import { useEffect, useState } from 'react';
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
import VoiceAssistant from '../components/voice/VoiceAssistant';

const Workspace = () => {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const token = useAuthStore((s) => s.token);
  const setChannels = useChannelStore((s) => s.setChannels);
  const activeChannelId = useChannelStore((s) => s.activeChannelId);
  const setUsers = useUserStore((s) => s.setUsers);
  const activeConversation = useDMStore((s) => s.activeConversation);
  const { typingUsers } = useSocket();

  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [prevTarget, setPrevTarget] = useState(`${activeChannelId}-${activeConversation?.id}`);
  const currentTarget = `${activeChannelId}-${activeConversation?.id}`;

  if (prevTarget !== currentTarget) {
    setPrevTarget(currentTarget);
    setMobileSidebarOpen(false);
  }

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
    <div className="flex h-screen overflow-hidden bg-canvas relative">
      {/* Mobile Drawer Backdrop */}
      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 md:hidden backdrop-blur-xs transition-opacity duration-200"
          onClick={() => setMobileSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar Drawer */}
      <div
        className={`fixed inset-y-0 left-0 z-50 transform md:relative md:translate-x-0 transition-transform duration-200 ease-in-out flex-shrink-0 ${
          mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <Sidebar onCloseMobile={() => setMobileSidebarOpen(false)} />
      </div>

      {/* Main Chat / DM / Welcome Area */}
      <div className="flex-1 flex overflow-hidden min-w-0">
        {activeChannelId ? (
          <ChatArea
            typingUsers={typingUsers}
            onToggleSidebar={() => setMobileSidebarOpen((prev) => !prev)}
          />
        ) : activeConversation ? (
          <DMArea
            onToggleSidebar={() => setMobileSidebarOpen((prev) => !prev)}
          />
        ) : (
          <WelcomeScreen
            onToggleSidebar={() => setMobileSidebarOpen((prev) => !prev)}
          />
        )}
      </div>

      <VoiceAssistant />
    </div>
  );
};

export default Workspace;
