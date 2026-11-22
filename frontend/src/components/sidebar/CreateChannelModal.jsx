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
    <Modal isOpen={isOpen} onClose={onClose} title="Create channel">
      <div className="space-y-4">
        <div>
          <label htmlFor="channel-name-input" className="block text-xs font-medium text-ink-secondary mb-1">
            Channel name
          </label>
          <div className="flex items-center bg-input border border-border-strong rounded-lg overflow-hidden focus-within:border-accent focus-within:ring-1 focus-within:ring-accent transition-colors">
            <span className="px-3 text-ink-faint font-mono text-sm border-r border-border-subtle bg-surface select-none">
              #
            </span>
            <input
              id="channel-name-input"
              type="text"
              placeholder="e.g. engineering"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="flex-1 bg-transparent px-3 py-2 text-sm text-ink-primary placeholder:text-ink-faint outline-none"
            />
          </div>
        </div>

        <div>
          <label htmlFor="channel-description-input" className="block text-xs font-medium text-ink-secondary mb-1">
            Topic or description (optional)
          </label>
          <textarea
            id="channel-description-input"
            placeholder="What should people use this channel for?"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="w-full bg-input border border-border-strong rounded-lg px-3 py-2 text-sm text-ink-primary placeholder:text-ink-faint resize-none outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-colors"
          />
        </div>

        <div className="pt-2 flex justify-end gap-2 border-t border-border-subtle">
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-1.5 rounded-lg border border-border-strong text-ink-secondary hover:text-ink-primary hover:bg-surface-hover text-xs font-medium transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleCreate}
            disabled={!name.trim() || loading}
            className="px-4 py-1.5 rounded-lg bg-accent hover:bg-accent-hover text-white text-xs font-semibold disabled:opacity-40 transition-colors shadow-xs"
          >
            {loading ? 'Creating...' : 'Create channel'}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default CreateChannelModal;
