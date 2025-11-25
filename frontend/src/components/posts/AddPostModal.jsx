import React, { useState } from 'react';
import { X } from 'lucide-react';

const AddPostModal = ({ onClose, onAdd, clubId }) => {
  const [eventTitle, setEventTitle] = useState('');
  const [caption, setCaption] = useState('');
  const [imageUrls, setImageUrls] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!eventTitle || !caption) {
      alert('Please fill in all required fields');
      return;
    }

    setLoading(true);
    const images = imageUrls.split(',').map(url => url.trim()).filter(Boolean);
    
    const result = await onAdd({ 
      eventTitle, 
      caption, 
      images, 
      clubId 
    });
    
    if (result.success) {
      onClose();
    } else {
      alert(result.error || 'Failed to add post');
    }
    
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg">
        <div className="flex items-center justify-between p-6 border-b">
          <h3 className="text-xl font-bold">Add Post</h3>
          <button 
            onClick={onClose} 
            className="p-2 hover:bg-gray-100 rounded-full transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-6 space-y-4">
          <input 
            type="text" 
            placeholder="Event Title *"
            value={eventTitle} 
            onChange={(e) => setEventTitle(e.target.value)}
            className="w-full p-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400" 
          />
          
          <textarea 
            placeholder="Caption *"
            value={caption} 
            onChange={(e) => setCaption(e.target.value)}
            className="w-full p-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400"
            rows="4" 
          />
          
          <input 
            type="text" 
            placeholder="Image URLs (comma separated, optional)"
            value={imageUrls} 
            onChange={(e) => setImageUrls(e.target.value)}
            className="w-full p-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400" 
          />
          
          <button 
            onClick={handleSubmit}
            disabled={loading}
            className="w-full py-3 rounded-xl font-semibold text-white disabled:opacity-50 transition"
            style={{ background: '#ab83c3' }}
          >
            {loading ? 'Adding...' : 'Add Post'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddPostModal;