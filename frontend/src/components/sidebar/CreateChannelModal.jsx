import { useState } from 'react';
import Modal from '../ui/Modal';
import { createChannel } from '../../api/channels';
import useChannelStore from '../../store/channelStore';
import toast from 'react-hot-toast';

const CreateChannelModal = ({ isOpen, onClose }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const addChannel = useChannelStore((s) => s.addChannel);
  const setActiveChannel = useChannelStore((s) => s.setActiveChannel);

  const handleCreate = async () => {
    if (!name.trim()) return;
    setLoading(true);
    try {
      const res = await createChannel(name.trim(), description.trim());
      addChannel(res.data.channel);
      setActiveChannel(res.data.channel.id);
      toast.success(`#${res.data.channel.name} created!`);
      setName('');
      setDescription('');
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to create channel');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create a channel">
      <div className="px-6 pb-4">
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-300 mb-1">Channel name</label>
          <div className="flex items-center bg-[#2c2d30] border border-[#383a40] rounded-lg overflow-hidden focus-within:border-[#4a9eed]">
            <span className="px-3 text-gray-400 font-medium text-sm border-r border-[#383a40] h-full flex items-center bg-[#2c2d30] select-none">
              #
            </span>
            <input
              id="channel-name-input"
              type="text"
              placeholder="e.g. budget-planning"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="flex-1 bg-transparent px-3 py-2.5 text-sm text-white placeholder-gray-500 outline-none"
            />
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-300 mb-1">Description (optional)</label>
          <textarea
            id="channel-description-input"
            placeholder="What's this channel about?"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full bg-[#2c2d30] border border-[#383a40] rounded-lg px-3 py-2.5 text-sm text-white placeholder-gray-500 resize-none h-32 outline-none focus:border-[#4a9eed]"
          />
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
          onClick={handleCreate}
          disabled={loading || !name.trim()}
          className="bg-[#4a55c8] hover:bg-[#5561d4] text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Creating...' : 'Create'}
        </button>
      </div>
    </Modal>
  );
};

export default CreateChannelModal;
