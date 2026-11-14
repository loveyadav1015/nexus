const UserAvatar = ({ user, size = 'md', showStatus = false }) => {
  const sizeClasses = {
    sm: 'w-6 h-6 text-[10px]',
    md: 'w-9 h-9 text-sm',
    lg: 'w-16 h-16 text-xl',
  };

  const statusDotSize = {
    sm: 'w-2 h-2',
    md: 'w-2.5 h-2.5',
    lg: 'w-3 h-3',
  };

  const statusColors = {
    online: 'bg-[#2bac76]',
    away: 'bg-[#e8a723]',
    offline: 'bg-[#6b7280]',
  };

  const initial = user?.display_name
    ? user.display_name.charAt(0).toUpperCase()
    : user?.username
    ? user.username.charAt(0).toUpperCase()
    : '?';

  return (
    <div className={`relative flex-shrink-0 ${sizeClasses[size]}`}>
      {user?.avatar_url ? (
        <img
          src={user.avatar_url}
          alt={user.display_name || user.username}
          className="rounded-full object-cover w-full h-full"
        />
      ) : (
        <div className={`rounded-full bg-[#4a55c8] flex items-center justify-center text-white font-semibold w-full h-full`}>
          {initial}
        </div>
      )}
      {showStatus && user?.status && (
        <span
          className={`absolute bottom-0 right-0 ${statusDotSize[size]} rounded-full border-2 border-[#19171d] ${statusColors[user.status] || statusColors.offline}`}
        />
      )}
    </div>
  );
};

export default UserAvatar;
