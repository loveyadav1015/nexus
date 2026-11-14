import { MessageSquare } from 'lucide-react';

const WelcomeScreen = () => {
  return (
    <div className="flex-1 flex items-center justify-center bg-[#1d1c1d]">
      <div className="text-center">
        <div className="flex justify-center mb-4">
          <div className="bg-[#4a55c8] rounded-full w-16 h-16 flex items-center justify-center">
            <MessageSquare size={32} className="text-white" />
          </div>
        </div>
        <h2 className="text-xl font-semibold text-white mb-2">Welcome to Mini Slack</h2>
        <p className="text-gray-400 text-sm max-w-xs">
          Select a channel or start a direct message to begin chatting with your team.
        </p>
      </div>
    </div>
  );
};

export default WelcomeScreen;
