import React, { useState } from 'react';
import { X, AlertCircle } from 'lucide-react';

const AddMediaModal = ({ clubId, onClose, onAdd }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState('youtube');
  const [link, setLink] = useState('');
  const [loading, setLoading] = useState(false);
  const [urlError, setUrlError] = useState('');

  // Validate URL format
  const validateUrl = (url) => {
    if (!url.trim()) {
      setUrlError('URL is required');
      return false;
    }
    try {
      new URL(url.trim());
      setUrlError('');
      return true;
    } catch (error) {
      setUrlError('Invalid URL format. Please enter a valid URL (e.g., https://example.com/video.mp4)');
      return false;
    }
  };

  const handleLinkChange = (e) => {
    setLink(e.target.value);
    if (e.target.value.trim()) {
      validateUrl(e.target.value);
    } else {
      setUrlError('');
    }
  };

  const handleAdd = async () => {
    if (!title.trim()) {
      alert('Please enter a title');
      return;
    }

    if (!link.trim()) {
      alert('Please enter a URL');
      return;
    }

    // Validate URL before submitting
    if (!validateUrl(link)) {
      alert('Please enter a valid URL');
      return;
    }

    console.log('📤 Adding media:', { title, type, link, description });
    setLoading(true);
    
    const result = await onAdd(clubId, { 
      title: title.trim(), 
      description: description.trim(), 
      type, 
      link: link.trim() 
    });
    
    if (result.success) {
      console.log('✅ Media added successfully');
      onClose();
    } else {
      console.error('❌ Failed to add media:', result.error);
      alert(result.error || 'Failed to add media');
    }
    
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg">
        <div className="flex items-center justify-between p-6 border-b">
          <h3 className="text-xl font-bold">Add Media</h3>
          <button 
            onClick={onClose} 
            className="p-2 hover:bg-gray-100 rounded-full transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-6 space-y-4">
          <input 
            placeholder="Media Title *" 
            value={title} 
            onChange={e => setTitle(e.target.value)} 
            className="w-full p-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400" 
          />
          
          <textarea 
            placeholder="Description (optional)" 
            value={description} 
            onChange={e => setDescription(e.target.value)} 
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
          
          <div>
            <input 
              placeholder="Link URL *" 
              value={link} 
              onChange={handleLinkChange}
              className={`w-full p-3 border rounded-xl focus:outline-none focus:ring-2 ${
                urlError ? 'border-red-500 focus:ring-red-400' : 'border-gray-300 focus:ring-purple-400'
              }`}
            />
            {urlError && (
              <div className="mt-2 flex items-start gap-2 text-red-600 text-sm">
                <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>{urlError}</span>
              </div>
            )}
          </div>
          
          <div className="flex gap-2">
            <button 
              onClick={handleAdd} 
              disabled={loading || urlError || !link.trim()}
              className="flex-1 py-3 rounded-xl font-semibold text-white disabled:opacity-50 transition" 
              style={{ background: '#ab83c3' }}
            >
              {loading ? 'Adding...' : 'Add Media'}
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

export default AddMediaModal;