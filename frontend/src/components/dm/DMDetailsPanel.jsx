import { X, FileText } from 'lucide-react';
import UserAvatar from '../ui/UserAvatar';
import { format } from 'date-fns';

const DMDetailsPanel = ({ user, onClose }) => {
  if (!user) return null;

  const statusColors = { online: 'bg-[#2bac76]', away: 'bg-[#e8a723]', offline: 'bg-[#6b7280]' };
  const statusLabels = { online: 'Active', away: 'Away', offline: 'Offline' };
  const status = user.status || 'offline';

  const placeholderFiles = [
    { name: 'ProjectPlan_v2.pdf', type: 'Recent documents' },
    { name: 'DesignSpecs.fig', type: 'Recent documents' },
    { name: 'MeetingNotes.pdf', type: 'Recent documents' },
  ];

  return (
    <div className="w-72 border-l border-[#383a40] bg-[#1d1c1d] flex flex-col h-full flex-shrink-0">
      <div className="h-14 border-b border-[#383a40] px-4 flex items-center justify-between flex-shrink-0">
        <span className="font-semibold text-white text-lg">Details</span>
        {onClose && (
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white p-1 rounded hover:bg-[#27292d] transition-colors"
            aria-label="Close details"
          >
            <X size={18} />
          </button>
        )}
      </div>

      <div className="p-4 flex flex-col items-center gap-2 text-center">
        <UserAvatar user={user} size="lg" showStatus />
        <h3 className="text-lg font-semibold text-white">{user.display_name || user.username}</h3>
        <div className="flex items-center gap-1.5">
          <span className={`w-2 h-2 rounded-full ${statusColors[status]}`} />
          <span className="text-sm text-gray-400">{statusLabels[status]}</span>
        </div>
        {user.bio && <p className="text-sm text-gray-400 mt-1">{user.bio}</p>}
      </div>

      <div className="px-4 py-3 border-t border-[#383a40]">
        <div className="mb-3">
          <span className="text-xs font-semibold uppercase text-gray-500 tracking-wider mb-0.5 block">Username</span>
          <span className="text-sm text-gray-200">@{user.username}</span>
        </div>
        {user.created_at && (
          <div className="mb-3">
            <span className="text-xs font-semibold uppercase text-gray-500 tracking-wider mb-0.5 block">Member Since</span>
            <span className="text-sm text-gray-200">{format(new Date(user.created_at), 'MMM d, yyyy')}</span>
          </div>
        )}
      </div>

      <div className="px-4 py-3 border-t border-[#383a40]">
        <span className="text-xs font-semibold uppercase text-gray-500 tracking-wider mb-2 block">Shared Files</span>
        {placeholderFiles.map((file, i) => (
          <div
            key={i}
            className="flex items-center gap-3 py-2 hover:bg-[#27292d] rounded px-2 cursor-pointer transition-colors"
          >
            <div className="w-8 h-8 bg-[#e8502a]/10 rounded flex items-center justify-center flex-shrink-0">
              <FileText size={16} className="text-[#e8502a]" />
            </div>
            <div className="min-w-0">
              <p className="text-sm text-gray-200 font-medium truncate">{file.name}</p>
              <p className="text-xs text-gray-500">{file.type}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DMDetailsPanel;
