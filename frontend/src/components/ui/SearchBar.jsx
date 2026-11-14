import { useState, useEffect, useCallback } from 'react';
import { Search, X } from 'lucide-react';
import { searchMessages } from '../../api/search';
import { format } from 'date-fns';
import useChannelStore from '../../store/channelStore';
import useDMStore from '../../store/dmStore';

const SearchBar = ({ onClose }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const setActiveChannel = useChannelStore((s) => s.setActiveChannel);
  const setActiveConversation = useDMStore((s) => s.setActiveConversation);

  const debouncedSearch = useCallback(
    (() => {
      let timeout;
      return (q) => {
        clearTimeout(timeout);
        timeout = setTimeout(async () => {
          if (!q.trim()) {
            setResults([]);
            return;
          }
          setLoading(true);
          try {
            const res = await searchMessages(q);
            setResults(res.data.results);
          } catch (err) {
            console.error('Search failed:', err);
          } finally {
            setLoading(false);
          }
        }, 400);
      };
    })(),
    []
  );

  useEffect(() => {
    debouncedSearch(query);
  }, [query, debouncedSearch]);

  const highlightMatch = (text, searchQuery) => {
    if (!searchQuery.trim()) return text;
    const regex = new RegExp(`(${searchQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    const parts = text.split(regex);
    return parts.map((part, i) =>
      regex.test(part) ? (
        <mark key={i} className="bg-[#4a9eed]/20 text-[#6ab0f5] rounded px-0.5 font-medium">
          {part}
        </mark>
      ) : (
        part
      )
    );
  };

  const handleResultClick = (result) => {
    setActiveChannel(result.channel_id);
    setActiveConversation(null);
    onClose();
  };

  return (
    <div className="absolute top-14 right-0 w-[400px] bg-[#222529] border border-[#383a40] rounded-xl shadow-2xl z-40 max-h-[480px] overflow-hidden flex flex-col">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-[#383a40]">
        <Search size={16} className="text-gray-400 flex-shrink-0" />
        <input
          type="text"
          placeholder="Search messages..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          autoFocus
          className="flex-1 bg-transparent text-white text-sm outline-none placeholder-gray-500"
        />
        <button onClick={onClose} className="text-gray-400 hover:text-white" aria-label="Close search">
          <X size={16} />
        </button>
      </div>

      <div className="overflow-y-auto flex-1">
        {loading && (
          <div className="px-4 py-8 text-center text-sm text-gray-500">Searching...</div>
        )}
        {!loading && results.length === 0 && query.trim() && (
          <div className="px-4 py-8 text-center text-sm text-gray-500">
            No results for &quot;{query}&quot;
          </div>
        )}
        {!loading && results.map((result) => (
          <div
            key={result.id}
            onClick={() => handleResultClick(result)}
            className="px-4 py-3 hover:bg-[#27292d] cursor-pointer border-b border-[#383a40]/50 transition-colors"
          >
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs bg-[#27292d] border border-[#383a40] text-[#4a9eed] rounded px-2 py-0.5 font-medium">
                #{result.channel_name}
              </span>
              <span className="text-xs text-gray-400">{result.username}</span>
              <span className="text-xs text-gray-500 ml-auto">
                {format(new Date(result.created_at), 'h:mm a')}
              </span>
            </div>
            <p className="text-sm text-gray-200 leading-relaxed">
              {highlightMatch(result.content, query)}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SearchBar;
