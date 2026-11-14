import { useState } from 'react';
import { Search, Phone, Info, Settings } from 'lucide-react';
import SearchBar from '../ui/SearchBar';

const ChatHeader = ({ channel }) => {
  const [showSearch, setShowSearch] = useState(false);

  if (!channel) return null;

  return (
    <div className="h-14 border-b border-[#383a40] flex items-center px-4 gap-3 bg-[#1d1c1d] relative flex-shrink-0">
      <div className="flex items-center gap-2 flex-1 min-w-0">
        <span className="text-gray-400">#</span>
        <span className="font-semibold text-white text-base">{channel.name}</span>
        {channel.description && (
          <>
            <div className="w-px h-5 bg-[#383a40] mx-2 flex-shrink-0" />
            <span className="text-sm text-gray-400 truncate max-w-xs">{channel.description}</span>
          </>
        )}
      </div>

      <div className="flex items-center gap-1">
        <button
          className="p-1.5 rounded text-gray-400 hover:text-white hover:bg-[#27292d] cursor-pointer transition-colors"
          aria-label="Call"
        >
          <Phone size={16} />
        </button>
        <button
          onClick={() => setShowSearch(!showSearch)}
          className="p-1.5 rounded text-gray-400 hover:text-white hover:bg-[#27292d] cursor-pointer transition-colors"
          aria-label="Search"
        >
          <Search size={16} />
        </button>
        <button
          className="p-1.5 rounded text-gray-400 hover:text-white hover:bg-[#27292d] cursor-pointer transition-colors"
          aria-label="Channel info"
        >
          <Info size={16} />
        </button>
        <button
          className="p-1.5 rounded text-gray-400 hover:text-white hover:bg-[#27292d] cursor-pointer transition-colors"
          aria-label="Settings"
        >
          <Settings size={16} />
        </button>
      </div>

      {showSearch && <SearchBar onClose={() => setShowSearch(false)} />}
    </div>
  );
};

export default ChatHeader;
