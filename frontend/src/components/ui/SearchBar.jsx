import { useState, useEffect, useRef } from 'react';
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
  const timeoutRef = useRef(null);

  useEffect(() => {
    if (!query.trim()) return;
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await searchMessages(query);
        setResults(res.data.results);
      } catch (err) {
        console.error('Search failed:', err);
      } finally {
        setLoading(false);
      }
    }, 400);

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [query]);

  const handleQueryChange = (e) => {
    const val = e.target.value;
    setQuery(val);
    if (!val.trim()) {
      setResults([]);
    }
  };

  const highlightMatch = (text, searchQuery) => {
    if (!searchQuery.trim()) return text;
    const regex = new RegExp(`(${searchQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    const parts = text.split(regex);
    return parts.map((part, i) =>
      regex.test(part) ? (
        <mark key={i} className="bg-accent/15 text-accent font-medium rounded px-0.5">
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
    <div
      role="dialog"
      aria-label="Search messages"
      className="absolute top-12 right-4 w-96 max-w-[calc(100vw-2rem)] bg-surface border border-border-strong rounded-xl shadow-2xl z-40 max-h-[460px] overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-150"
    >
      <div className="flex items-center gap-2 px-3.5 py-2.5 border-b border-border-subtle bg-sidebar/50">
        <Search size={15} className="text-ink-secondary flex-shrink-0" />
        <input
          type="text"
          placeholder="Search messages..."
          value={query}
          onChange={handleQueryChange}
          autoFocus
          className="flex-1 bg-transparent text-ink-primary text-sm outline-none placeholder:text-ink-faint"
        />
        <button
          onClick={onClose}
          className="text-ink-secondary hover:text-ink-primary p-1 rounded hover:bg-surface-hover transition-colors"
          aria-label="Close search"
        >
          <X size={15} />
        </button>
      </div>

      <div className="overflow-y-auto flex-1">
        {loading && (
          <div className="px-4 py-8 text-center text-xs text-ink-faint">Searching messages...</div>
        )}
        {!loading && results.length === 0 && query.trim() && (
          <div className="px-4 py-8 text-center text-xs text-ink-muted">
            No results found for &quot;{query}&quot;
          </div>
        )}
        {!loading && results.map((result) => (
          <div
            key={result.id}
            onClick={() => handleResultClick(result)}
            className="px-4 py-3 hover:bg-sidebar/50 cursor-pointer border-b border-border-subtle/50 transition-colors"
          >
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[11px] font-mono bg-canvas border border-border-subtle text-accent rounded px-1.5 py-0.5">
                #{result.channel_name}
              </span>
              <span className="text-xs font-medium text-ink-primary">{result.username}</span>
              <span className="text-[11px] font-mono text-ink-faint ml-auto">
                {format(new Date(result.created_at), 'h:mm a')}
              </span>
            </div>
            <p className="text-xs text-ink-secondary leading-relaxed line-clamp-2">
              {highlightMatch(result.content, query)}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SearchBar;
