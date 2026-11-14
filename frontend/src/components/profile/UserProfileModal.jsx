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
        <div className="flex justify-center mb-4">
          <UserAvatar user={previewUser} size="lg" showStatus />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-300 mb-1">Avatar URL</label>
          <input
            type="text"
            placeholder="https://example.com/avatar.jpg"
            value={avatarUrl}
            onChange={(e) => setAvatarUrl(e.target.value)}
            className="w-full bg-[#2c2d30] border border-[#383a40] rounded-lg px-3 py-2.5 text-sm text-white placeholder-gray-500 outline-none focus:border-[#4a9eed]"
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-300 mb-1">Display Name</label>
          <input
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            className="w-full bg-[#2c2d30] border border-[#383a40] rounded-lg px-3 py-2.5 text-sm text-white placeholder-gray-500 outline-none focus:border-[#4a9eed]"
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-300 mb-1">Bio</label>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="Tell us about yourself"
            className="w-full bg-[#2c2d30] border border-[#383a40] rounded-lg px-3 py-2.5 text-sm text-white placeholder-gray-500 resize-none h-20 outline-none focus:border-[#4a9eed]"
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-300 mb-1">Status</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full bg-[#2c2d30] border border-[#383a40] rounded-lg px-3 py-2.5 text-sm text-white outline-none focus:border-[#4a9eed]"
          >
            <option value="online">🟢 Online</option>
            <option value="away">🟡 Away</option>
            <option value="offline">⚫ Offline</option>
          </select>
        </div>
      </div>

      <div className="px-6 pb-6 pt-4 border-t border-[#383a40] flex justify-end gap-3">
        <button
          onClick={onClose}
          className="bg-transparent border border-[#383a40] text-gray-300 hover:bg-[#27292d] px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          disabled={loading}
          className="bg-[#4a55c8] hover:bg-[#5561d4] text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors disabled:opacity-50"
        >
          {loading ? 'Saving...' : 'Save'}
        </button>
      </div>
    </Modal>
  );
};

export default UserProfileModal;
