import React, { useState } from 'react';
import { Search } from 'lucide-react';

const CommunitiesScreen = ({ clubs, onClubClick, joinedClubs, loading }) => {
  const [query, setQuery] = useState('');

  const filterClubs = (type) => {
    const lower = query.trim().toLowerCase();
    return clubs.filter(c => 
      c.type === type && (!lower || c.name.toLowerCase().includes(lower))
    );
  };

  const technicalClubs = filterClubs('technical');
  const culturalClubs = filterClubs('cultural');

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: '#6B4A63' }}></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="relative">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search clubs..."
          className="w-full p-4 bg-cream-card text-ink rounded-2xl border border-cream-dim focus:outline-none focus:ring-2 focus:ring-plum-300"
        />
        <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
          <Search className="w-5 h-5 text-ink-faint" />
        </div>
      </div>

      {/* Technical Clubs */}
      <div>
        <h3 className="font-display font-semibold text-ink mb-3">Technical Clubs</h3>
        {technicalClubs.length > 0 ? (
          <div className="grid grid-cols-2 gap-4">
            {technicalClubs.map(club => (
              <button 
                key={club._id} 
                onClick={() => onClubClick(club._id)}
                className="bg-cream-card rounded-2xl shadow-sm border border-cream-dim p-4 text-center hover:shadow-md transition"
              >
                <div 
                  className="w-20 h-20 rounded-full mx-auto mb-3 flex items-center justify-center text-4xl shadow-lg" 
                  style={{ background: club.color }}
                >
                  {club.logo}
                </div>
                <h4 className="font-semibold text-sm mb-1 text-ink">{club.name}</h4>
                <p className="text-xs text-ink-muted">{club.communityMembers} members</p>
                {joinedClubs.includes(club._id) && (
                  <span className="inline-block mt-2 px-3 py-1 bg-sage-400/20 text-sage-600 text-xs rounded-full">
                    Joined
                  </span>
                )}
              </button>
            ))}
          </div>
        ) : (
          <p className="text-center text-ink-muted py-4">No technical clubs found</p>
        )}
      </div>

      {/* Cultural Clubs */}
      <div>
        <h3 className="font-display font-semibold text-ink mb-3 mt-6">Cultural Clubs</h3>
        {culturalClubs.length > 0 ? (
          <div className="grid grid-cols-2 gap-4">
            {culturalClubs.map(club => (
              <button 
                key={club._id} 
                onClick={() => onClubClick(club._id)}
                className="bg-cream-card rounded-2xl shadow-sm border border-cream-dim p-4 text-center hover:shadow-md transition"
              >
                <div 
                  className="w-20 h-20 rounded-full mx-auto mb-3 flex items-center justify-center text-4xl shadow-lg" 
                  style={{ background: club.color }}
                >
                  {club.logo}
                </div>
                <h4 className="font-semibold text-sm mb-1 text-ink">{club.name}</h4>
                <p className="text-xs text-ink-muted">{club.communityMembers} members</p>
                {joinedClubs.includes(club._id) && (
                  <span className="inline-block mt-2 px-3 py-1 bg-sage-400/20 text-sage-600 text-xs rounded-full">
                    Joined
                  </span>
                )}
              </button>
            ))}
          </div>
        ) : (
          <p className="text-center text-ink-muted py-4">No cultural clubs found</p>
        )}
      </div>
    </div>
  );
};

export default CommunitiesScreen;