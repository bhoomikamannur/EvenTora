import React, { useState } from 'react';
import { Search, Plus, Edit2, Trash2 } from 'lucide-react';
import ClubLogo from '../components/common/ClubLogo';
import AddClubModal from '../components/clubs/AddClubModal';
import EditClubModal from '../components/clubs/EditClubModal';

const CommunitiesScreen = ({
  clubs,
  onClubClick,
  joinedClubs,
  loading,
  isOrganizer,
  onCreateClub,
  onUpdateClub,
  onDeleteClub
}) => {
  const [query, setQuery] = useState('');
  const [showAddClub, setShowAddClub] = useState(false);
  const [editingClub, setEditingClub] = useState(null);
  const [deletingClubId, setDeletingClubId] = useState(null);

  const filterClubs = (type) => {
    const lower = query.trim().toLowerCase();
    return clubs.filter(c => 
      c.type === type && (!lower || c.name.toLowerCase().includes(lower))
    );
  };

  const technicalClubs = filterClubs('technical');
  const culturalClubs = filterClubs('cultural');

  const handleDelete = async (clubId) => {
    if (!window.confirm('Delete this club? This will also remove its posts, events, and threads. This cannot be undone.')) {
      return;
    }
    setDeletingClubId(clubId);
    const result = await onDeleteClub(clubId);
    setDeletingClubId(null);
    if (!result.success) {
      alert(result.error || 'Failed to delete club');
    }
  };

  const ClubCard = ({ club }) => (
    <div className="relative bg-cream-card rounded-2xl shadow-sm border border-cream-dim p-4 text-center hover:shadow-md transition">
      {isOrganizer && (
        <div className="absolute top-2 right-2 flex gap-1 z-10">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setEditingClub(club);
            }}
            className="p-1.5 bg-cream-dim rounded-full hover:bg-plum-100 transition"
            title="Edit club"
          >
            <Edit2 className="w-3.5 h-3.5 text-ink-soft" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleDelete(club._id);
            }}
            disabled={deletingClubId === club._id}
            className="p-1.5 bg-cream-dim rounded-full hover:bg-red-100 transition disabled:opacity-50"
            title="Delete club"
          >
            <Trash2 className="w-3.5 h-3.5 text-red-500" />
          </button>
        </div>
      )}
      <button onClick={() => onClubClick(club._id)} className="w-full">
        <ClubLogo club={club} size={80} className="mx-auto mb-3 shadow-lg text-4xl" />
        <h4 className="font-semibold text-sm mb-1 text-ink">{club.name}</h4>
        <p className="text-xs text-ink-muted">{club.communityMembers} members</p>
        {joinedClubs.includes(club._id) && (
          <span className="inline-block mt-2 px-3 py-1 bg-sage-400/20 text-sage-600 text-xs rounded-full">
            Joined
          </span>
        )}
      </button>
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: '#6B4A63' }}></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Search Bar + Add Club (organizer only) */}
      <div className="flex gap-3">
        <div className="relative flex-1">
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
        {isOrganizer && (
          <button
            onClick={() => setShowAddClub(true)}
            className="flex items-center gap-2 px-4 rounded-2xl font-semibold text-white transition flex-shrink-0"
            style={{ background: '#6B4A63' }}
          >
            <Plus className="w-5 h-5" />
            <span className="hidden sm:inline">Add Club</span>
          </button>
        )}
      </div>

      {/* Technical Clubs */}
      <div>
        <h3 className="font-display font-semibold text-ink mb-3">Technical Clubs</h3>
        {technicalClubs.length > 0 ? (
          <div className="grid grid-cols-2 gap-4">
            {technicalClubs.map(club => <ClubCard key={club._id} club={club} />)}
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
            {culturalClubs.map(club => <ClubCard key={club._id} club={club} />)}
          </div>
        ) : (
          <p className="text-center text-ink-muted py-4">No cultural clubs found</p>
        )}
      </div>

      {showAddClub && (
        <AddClubModal
          onClose={() => setShowAddClub(false)}
          onAdd={onCreateClub}
        />
      )}

      {editingClub && (
        <EditClubModal
          club={editingClub}
          onClose={() => setEditingClub(null)}
          onSave={onUpdateClub}
        />
      )}
    </div>
  );
};

export default CommunitiesScreen;
