import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

const EditEventModal = ({ event, onClose, onSave }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [venue, setVenue] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (event) {
      setTitle(event.title || '');
      setDescription(event.description || '');
      setVenue(event.venue || '');
      setDate(event.date || '');
      setTime(event.time || '');
    }
  }, [event]);

  if (!event) return null;

  const handleSave = async () => {
    if (!title || !venue || !date || !time) {
      alert('Please fill in all required fields');
      return;
    }

    setLoading(true);
    
    const result = await onSave(event._id, { 
      title, 
      description, 
      venue, 
      date, 
      time 
    });
    
    if (result.success) {
      onClose();
    } else {
      alert(result.error || 'Failed to update event');
    }
    
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg">
        <div className="flex items-center justify-between p-6 border-b">
          <h3 className="text-xl font-bold">Edit Event</h3>
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
            placeholder="Event Name *"
            className="w-full p-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400" 
          />
          
          <textarea 
            value={description} 
            onChange={e => setDescription(e.target.value)} 
            placeholder="Description"
            rows="3" 
            className="w-full p-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400" 
          />
          
          <input 
            value={venue} 
            onChange={e => setVenue(e.target.value)} 
            placeholder="Venue *"
            className="w-full p-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400" 
          />
          
          <input 
            type="date" 
            value={date} 
            onChange={e => setDate(e.target.value)} 
            className="w-full p-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400" 
          />
          
          <input 
            type="time" 
            value={time} 
            onChange={e => setTime(e.target.value)} 
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

export default EditEventModal;