import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

const EditPostModal = ({ post, onClose, onSave }) => {
  const [eventTitle, setEventTitle] = useState('');
  const [caption, setCaption] = useState('');
  const [images, setImages] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (post) {
      setEventTitle(post.eventTitle || '');
      setCaption(post.caption || '');
      setImages((post.images || []).join(', '));
    }
  }, [post]);

  if (!post) return null;

  const handleSave = async () => {
    if (!eventTitle || !caption) {
      alert('Please fill in all required fields');
      return;
    }

    setLoading(true);
    const imgs = images.split(',').map(s => s.trim()).filter(Boolean);
    
    const result = await onSave(post._id, { 
      eventTitle, 
      caption, 
      images: imgs 
    });
    
    if (result.success) {
      onClose();
    } else {
      alert(result.error || 'Failed to update post');
    }
    
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg">
        <div className="flex items-center justify-between p-6 border-b">
          <h3 className="text-xl font-bold">Edit Post</h3>
          <button 
            onClick={onClose} 
            className="p-2 hover:bg-gray-100 rounded-full transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-6 space-y-4">
          <input 
            value={eventTitle} 
            onChange={e => setEventTitle(e.target.value)} 
            placeholder="Event Title *"
            className="w-full p-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400" 
          />
          
          <textarea 
            value={caption} 
            onChange={e => setCaption(e.target.value)} 
            placeholder="Caption *"
            rows="4" 
            className="w-full p-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400" 
          />
          
          <input 
            value={images} 
            onChange={e => setImages(e.target.value)} 
            placeholder="Image URLs, comma separated" 
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

export default EditPostModal;