const UserAvatar = ({ user, size = 'md', showStatus = false }) => {
  const sizeClasses = {
    sm: 'w-6 h-6 text-[10px]',
    md: 'w-8 h-8 text-xs',
    lg: 'w-14 h-14 text-lg'
  };

  const statusDotSize = {
    sm: 'w-2 h-2',
    md: 'w-2.5 h-2.5',
    lg: 'w-3.5 h-3.5'
  };

  const statusConfig = {
    online: {
      color: 'bg-status-online',
      symbol: '●',
      label: 'Online'
    },
    away: {
      color: 'bg-status-away',
      symbol: '◐',
      label: 'Away'
    },
    offline: {
      color: 'bg-status-offline',
      symbol: '○',
      label: 'Offline'
    }
  };

  const initial = user?.display_name
    ? user.display_name.charAt(0).toUpperCase()
    : user?.username
    ? user.username.charAt(0).toUpperCase()
    : '?';

  const userStatus = user?.status || 'offline';
  const statusInfo = statusConfig[userStatus] || statusConfig.offline;

  return (
    <div className={`relative flex-shrink-0 ${sizeClasses[size]}`}>
      {user?.avatar_url ? (
        <img
          src={user.avatar_url}
          alt={user.display_name || user.username}
          className="rounded-full object-cover w-full h-full border border-border-subtle"
        />
      ) : (
        <div className="rounded-full bg-accent-faint border border-accent-border flex items-center justify-center text-accent font-semibold w-full h-full select-none">
          {initial}
        </div>
      )}
      {showStatus && (
        <span
          title={`Status: ${statusInfo.label}`}
          aria-label={statusInfo.label}
          className={`absolute -bottom-0.5 -right-0.5 ${statusDotSize[size]} rounded-full border-2 border-surface ${statusInfo.color}`}
        />
      )}
    </div>
  );
};

export default UserAvatar;
