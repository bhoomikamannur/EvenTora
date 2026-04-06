import React, { useState } from 'react';
import { X } from 'lucide-react';

const AddEventModal = ({ onClose, onAdd, clubId }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [venue, setVenue] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!title || !venue || !date || !time || !clubId) {
      alert('Please fill in all required fields. If issue persists, you must be an admin of a club.');
      return;
    }

    setLoading(true);
    
    const result = await onAdd({ 
      title, 
      description, 
      venue, 
      date, 
      time, 
      clubId 
    });
    
    if (result.success) {
      onClose();
    } else {
      alert(result.error || 'Failed to add event');
    }
    
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg">
        <div className="flex items-center justify-between p-6 border-b">
          <h3 className="text-xl font-bold">Add Event</h3>
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
            placeholder="Event Name *" 
            value={title} 
            onChange={(e) => setTitle(e.target.value)} 
            className="w-full p-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400" 
          />
          
          <textarea 
            placeholder="Description (optional)" 
            value={description} 
            onChange={(e) => setDescription(e.target.value)} 
            className="w-full p-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400" 
            rows="3" 
          />
          
          <input 
            type="text" 
            placeholder="Venue *" 
            value={venue} 
            onChange={(e) => setVenue(e.target.value)} 
            className="w-full p-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400" 
          />
          
          <input 
            type="date" 
            value={date} 
            onChange={(e) => setDate(e.target.value)} 
            className="w-full p-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400" 
          />
          
          <input 
            type="time" 
            value={time} 
            onChange={(e) => setTime(e.target.value)} 
            className="w-full p-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400" 
          />
          
          <button 
            onClick={handleSubmit} 
            disabled={loading}
            className="w-full py-3 rounded-xl font-semibold text-white disabled:opacity-50 transition" 
            style={{ background: '#ab83c3' }}
          >
            {loading ? 'Adding...' : 'Add Event'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddEventModal;