import React, { useState } from 'react';
import { X } from 'lucide-react';

const AddMemberModal = ({ clubId, onClose, onAdd }) => {
  const [name, setName] = useState('');
  const [position, setPosition] = useState('Member');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAdd = async () => {
    if (!name.trim()) {
      alert('Please enter member name');
      return;
    }

    setLoading(true);
    
    const result = await onAdd(clubId, { 
      name: name.trim(), 
      position,
      email: email.trim() 
    });
    
    if (result.success) {
      onClose();
    } else {
      alert(result.error || 'Failed to add member');
    }
    
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-md">
        <div className="flex items-center justify-between p-6 border-b">
          <h3 className="text-xl font-bold">Add Member</h3>
          <button 
            onClick={onClose} 
            className="p-2 hover:bg-gray-100 rounded-full transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-6 space-y-4">
          <input 
            placeholder="Full Name *" 
            value={name} 
            onChange={e => setName(e.target.value)} 
            className="w-full p-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400" 
          />
          
          <input 
            type="email"
            placeholder="Email *" 
            value={email} 
            onChange={e => setEmail(e.target.value)} 
            className="w-full p-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400" 
          />
          
          <select 
            value={position} 
            onChange={e => setPosition(e.target.value)} 
            className="w-full p-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400"
          >
            <option>Lead</option>
            <option>Co-Lead</option>
            <option>Team Lead</option>
            <option>Member</option>
          </select>
          
          <div className="flex gap-2">
            <button 
              onClick={handleAdd} 
              disabled={loading}
              className="flex-1 py-3 rounded-xl font-semibold text-white disabled:opacity-50 transition" 
              style={{ background: '#ab83c3' }}
            >
              {loading ? 'Adding...' : 'Add Member'}
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

export default AddMemberModal;