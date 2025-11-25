import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

const EditMediaModal = ({ media, onClose, onSave }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState('youtube');
  const [link, setLink] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (media) {
      setTitle(media.title || '');
      setDescription(media.description || '');
      setType(media.type || 'youtube');
      setLink(media.link || '');
    }
  }, [media]);

  if (!media) return null;

  const handleSave = async () => {
    if (!title.trim() || !link.trim()) {
      alert('Please fill in title and link');
      return;
    }

    setLoading(true);
    
    const result = await onSave(media.clubId, media._id, { 
      title: title.trim(), 
      description: description.trim(), 
      type, 
      link: link.trim() 
    });
    
    if (result.success) {
      onClose();
    } else {
      alert(result.error || 'Failed to update media');
    }
    
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg">
        <div className="flex items-center justify-between p-6 border-b">
          <h3 className="text-xl font-bold">Edit Media</h3>
          <button 
            onClick={onClose} 
            className="p-2 hover:bg-gray-100 rounded-full transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-6 space-y-4">
          <input 
            value={title} 
            onChange={e => setTitle(e.target.value)} 
            placeholder="Media Title *"
            className="w-full p-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400" 
          />
          
          <textarea 
            value={description} 
            onChange={e => setDescription(e.target.value)} 
            placeholder="Description"
            className="w-full p-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400" 
            rows="3" 
          />
          
          <select 
            value={type} 
            onChange={e => setType(e.target.value)} 
            className="w-full p-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400"
          >
            <option value="youtube">YouTube</option>
            <option value="instagram">Instagram</option>
            <option value="github">GitHub</option>
            <option value="other">Other Link</option>
          </select>
          
          <input 
            value={link} 
            onChange={e => setLink(e.target.value)} 
            placeholder="Link URL *"
            className="w-full p-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400" 
          />
          
          <div className="flex gap-2">
            <button 
              onClick={handleSave} 
              disabled={loading}
              className="flex-1 py-3 rounded-xl font-semibold text-white disabled:opacity-50 transition" 
              style={{ background: '#ab83c3' }}
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
            <button 
              onClick={onClose} 
              className="flex-1 py-3 rounded-xl font-semibold border hover:bg-gray-50 transition"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditMediaModal;