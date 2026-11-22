import { useState } from 'react';
import Modal from '../ui/Modal';
import UserAvatar from '../ui/UserAvatar';
import useAuthStore from '../../store/authStore';
import { updateUser, updateStatus } from '../../api/users';
import toast from 'react-hot-toast';

const UserProfileModal = ({ isOpen, onClose }) => {
  const user = useAuthStore((s) => s.user);
  const updateUserStore = useAuthStore((s) => s.updateUser);
  const [displayName, setDisplayName] = useState(user?.display_name || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [avatarUrl, setAvatarUrl] = useState(user?.avatar_url || '');
  const [status, setStatus] = useState(user?.status || 'online');
  const [voiceOptIn, setVoiceOptIn] = useState(() => {
    try {
      return localStorage.getItem('nexus_voice_opt_in') !== 'false';
    } catch {
      return true;
    }
  });
  const [loading, setLoading] = useState(false);

  const previewUser = {
    ...user,
    display_name: displayName || user?.username,
    avatar_url: avatarUrl || null,
    status,
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const res = await updateUser(user.id, {
        display_name: displayName,
        bio,
        avatar_url: avatarUrl || null,
      });
      await updateStatus(user.id, status);
      try {
        localStorage.setItem('nexus_voice_opt_in', String(voiceOptIn));
      } catch {
        // ignore
      }
      updateUserStore({ ...res.data.user, status });
      toast.success('Profile updated!');
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Profile">
      <div className="px-6 pb-4">
        <div className="flex justify-center mb-5">
          <UserAvatar user={previewUser} size="lg" showStatus />
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-ink-secondary mb-1.5">
              Avatar URL
            </label>
            <input
              type="text"
              placeholder="https://example.com/avatar.jpg"
              value={avatarUrl}
              onChange={(e) => setAvatarUrl(e.target.value)}
              className="w-full bg-input border border-border-strong rounded-lg px-3 py-2 text-sm text-ink-primary placeholder:text-ink-faint outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-ink-secondary mb-1.5">
              Display Name
            </label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full bg-input border border-border-strong rounded-lg px-3 py-2 text-sm text-ink-primary placeholder:text-ink-faint outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-ink-secondary mb-1.5">
              Bio
            </label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="A few words about what you do"
              className="w-full bg-input border border-border-strong rounded-lg px-3 py-2 text-sm text-ink-primary placeholder:text-ink-faint resize-none h-20 outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-ink-secondary mb-1.5">
              Availability Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full bg-input border border-border-strong rounded-lg px-3 py-2 text-sm text-ink-primary outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-colors"
            >
              <option value="online">Online (Available)</option>
              <option value="away">Away (In a meeting or stepped away)</option>
              <option value="offline">Offline</option>
            </select>
          </div>

          <div className="pt-3 border-t border-border-subtle">
            <div className="flex items-center justify-between gap-4">
              <div>
                <span className="text-xs font-semibold text-ink-primary block">
                  Voice Assistant
                </span>
                <span className="text-xs text-ink-muted block max-w-[280px] leading-relaxed">
                  Enables voice dictation and AI actions. Voice commands are processed securely by model providers.
                </span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
                <input
                  type="checkbox"
                  checked={voiceOptIn}
                  onChange={(e) => setVoiceOptIn(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-border-strong peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-accent" />
              </label>
            </div>
          </div>
        </div>
      </div>

      <div className="px-6 pb-6 pt-4 border-t border-border-subtle flex justify-end gap-3 bg-sidebar/30">
        <button
          type="button"
          onClick={onClose}
          className="bg-transparent border border-border-strong text-ink-primary hover:bg-surface-hover px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleSave}
          disabled={loading}
          className="bg-accent hover:bg-accent-hover text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
        >
          {loading ? 'Saving...' : 'Save changes'}
        </button>
      </div>
    </Modal>
  );
};

export default UserProfileModal;
