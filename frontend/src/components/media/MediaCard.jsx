import React from 'react';
import { Edit2, Trash2 } from 'lucide-react';

const MediaCard = ({ media, club, onDelete, onEdit, isAdmin }) => {
  const getMediaIcon = (type) => {
    switch(type) {
      case 'youtube': return '▶️';
      case 'instagram': return '📷';
      case 'github': return '💻';
      default: return '🔗';
    }
  };

  const getMediaColor = (type) => {
    switch(type) {
      case 'youtube': return '#FF0000';
      case 'instagram': return '#E4405F';
      case 'github': return '#333333';
      default: return '#6B4A63';
    }
  };

  return (
    <div className="bg-cream-card rounded-2xl shadow-sm border border-cream-dim overflow-hidden">
      <div className="relative">
        <div 
          className="h-48 flex items-center justify-center text-6xl"
          style={{ background: `linear-gradient(135deg, ${club?.color}80 0%, ${club?.color}40 100%)` }}
        >
          {getMediaIcon(media.type)}
        </div>
        
        {isAdmin && (
          <div className="absolute top-2 right-2 flex gap-2">
            <button 
              onClick={() => onEdit(media)} 
              className="p-2 bg-cream-card hover:bg-cream-dim rounded-lg shadow transition"
            >
              <Edit2 className="w-4 h-4 text-plum-600" />
            </button>
            <button 
              onClick={() => onDelete(media._id)} 
              className="p-2 bg-cream-card hover:bg-cream-dim rounded-lg shadow transition"
            >
              <Trash2 className="w-4 h-4 text-red-500" />
            </button>
          </div>
        )}
      </div>
      
      <div className="p-4">
        <div className="flex items-center gap-2 mb-2">
          <div 
            className="px-3 py-1 rounded-full text-xs font-semibold text-white"
            style={{ background: getMediaColor(media.type) }}
          >
            {media.type.toUpperCase()}
          </div>
          <span className="text-xs text-ink-muted">{media.timestamp}</span>
        </div>
        
        <h4 className="font-display font-semibold text-lg mb-1 text-ink">{media.title}</h4>
        
        {media.description && (
          <p className="text-ink-soft text-sm mb-3 line-clamp-2">{media.description}</p>
        )}
        
        <a 
          href={media.link} 
          target="_blank" 
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-white text-sm transition hover:opacity-90"
          style={{ background: club?.color }}
        >
          View {media.type === 'github' ? 'Repository' : 'Content'} →
        </a>
      </div>
    </div>
  );
};

export default MediaCard;