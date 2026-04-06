import React, { useState } from 'react';
import { X, Upload } from 'lucide-react';

const AddPostModal = ({ onClose, onAdd, clubId }) => {
  const [eventTitle, setEventTitle] = useState('');
  const [caption, setCaption] = useState('');
  const [imageFiles, setImageFiles] = useState([]);
  const [imagePreview, setImagePreview] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleImageSelect = (e) => {
    const files = Array.from(e.target.files);
    
    // Validate file types and size
    const validFiles = files.filter(file => {
      if (!file.type.startsWith('image/')) {
        alert(`${file.name} is not an image file`);
        return false;
      }
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        alert(`${file.name} is too large (max 5MB)`);
        return false;
      }
      return true;
    });

    setImageFiles(prev => [...prev, ...validFiles]);

    // Generate preview URLs
    validFiles.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(prev => [...prev, reader.result]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index) => {
    setImageFiles(prev => prev.filter((_, i) => i !== index));
    setImagePreview(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!eventTitle || !caption) {
      alert('Please fill in all required fields');
      return;
    }

    setLoading(true);
    
    // Create FormData for file upload
    const formData = new FormData();
    formData.append('eventTitle', eventTitle);
    formData.append('caption', caption);
    formData.append('clubId', clubId);
    
    // Append all image files
    imageFiles.forEach((file, idx) => {
      console.log(`📸 Appending image ${idx}: ${file.name} (${file.size} bytes)`);
      formData.append('images', file);
    });
    
    // Log FormData contents
    console.log('📤 FormData being sent:');
    for (let [key, value] of formData.entries()) {
      if (value instanceof File) {
        console.log(`  ${key}: File - ${value.name} (${value.size} bytes)`);
      } else {
        console.log(`  ${key}: ${value}`);
      }
    }
    
    const result = await onAdd(formData);
    
    if (result.success) {
      console.log('✅ Post created successfully');
      onClose();
    } else {
      console.error('❌ Failed to create post:', result.error);
      alert(result.error || 'Failed to add post');
    }
    
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg max-h-96 overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b sticky top-0 bg-white">
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
          
          {/* Image Upload */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Upload Images (optional, max 5MB each)
            </label>
            <div className="relative border-2 border-dashed border-gray-300 rounded-xl p-4 text-center cursor-pointer hover:border-purple-400 transition">
              <input 
                type="file" 
                multiple
                accept="image/*"
                onChange={handleImageSelect}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <div className="flex flex-col items-center gap-2">
                <Upload className="w-6 h-6 text-gray-400" />
                <p className="text-sm text-gray-600">Click or drag images here</p>
              </div>
            </div>
          </div>

          {/* Image Preview */}
          {imagePreview.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-semibold text-gray-700">{imagePreview.length} image(s) selected</p>
              <div className="grid grid-cols-2 gap-2">
                {imagePreview.map((preview, idx) => (
                  <div key={idx} className="relative group">
                    <img 
                      src={preview} 
                      alt={`Preview ${idx}`} 
                      className="w-full h-24 object-cover rounded-lg"
                    />
                    <button
                      onClick={() => removeImage(idx)}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
          
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