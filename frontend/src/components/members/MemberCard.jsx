import React from 'react';
import { Trash2 } from 'lucide-react';

const MemberCard = ({ member, club, isAdmin, onRemove, onUpdatePosition }) => {
  return (
    <div className="bg-cream-card rounded-xl p-4 flex items-center gap-4 shadow-sm border border-cream-dim">
      <div className="w-14 h-14 rounded-full flex items-center justify-center text-2xl flex-shrink-0" style={{ background: 'linear-gradient(135deg, #6B4A63 0%, #E8A33D 100%)' }}>
        👤
      </div>
      
      <div className="flex-1 min-w-0">
        <h4 className="font-semibold text-ink">{member.name}</h4>
        <p className="text-sm" style={{ color: club?.color }}>
          {member.position}
        </p>
        {member.email && (
          <p className="text-xs text-ink-muted mt-1">{member.email}</p>
        )}
      </div>

      {isAdmin && (
        <div className="flex items-center gap-2">
          <select 
            value={member.position} 
            onChange={(e) => onUpdatePosition(member._id, e.target.value)} 
            className="p-2 border border-cream-dim bg-cream-card text-ink rounded text-sm focus:outline-none focus:ring-2 focus:ring-plum-300"
          >
            <option>Lead</option>
            <option>Co-Lead</option>
            <option>Team Lead</option>
            <option>Member</option>
          </select>
          
          <button 
            onClick={() => onRemove(member._id)} 
            className="p-2 hover:bg-cream-dim rounded-lg text-red-500 transition"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>
      )}
    </div>
  );
};

export default MemberCard;