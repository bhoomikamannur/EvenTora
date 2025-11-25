import React from 'react';
import { Trash2 } from 'lucide-react';

const MemberCard = ({ member, club, isAdmin, onRemove, onUpdatePosition }) => {
  return (
    <div className="bg-white rounded-xl p-4 flex items-center gap-4 shadow-sm border border-gray-100">
      <div className="w-14 h-14 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center text-2xl flex-shrink-0">
        👤
      </div>
      
      <div className="flex-1 min-w-0">
        <h4 className="font-semibold text-gray-900">{member.name}</h4>
        <p className="text-sm" style={{ color: club?.color }}>
          {member.position}
        </p>
        {member.email && (
          <p className="text-xs text-gray-500 mt-1">{member.email}</p>
        )}
      </div>

      {isAdmin && (
        <div className="flex items-center gap-2">
          <select 
            value={member.position} 
            onChange={(e) => onUpdatePosition(member._id, e.target.value)} 
            className="p-2 border rounded text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
          >
            <option>Lead</option>
            <option>Co-Lead</option>
            <option>Team Lead</option>
            <option>Member</option>
          </select>
          
          <button 
            onClick={() => onRemove(member._id)} 
            className="p-2 hover:bg-gray-100 rounded-lg text-red-600 transition"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>
      )}
    </div>
  );
};

export default MemberCard;