import { useState, useEffect } from 'react';
import ApiService from '../services/api';

export const useClubs = () => {
  const [clubs, setClubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchClubs();
  }, []);

  const fetchClubs = async () => {
    try {
      setLoading(true);
      const response = await ApiService.getClubs();
      // Extract data array from new API response format
      const clubsArray = response.data?.data || response.data || [];
      setClubs(Array.isArray(clubsArray) ? clubsArray : []);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch clubs');
      setClubs([]);
    } finally {
      setLoading(false);
    }
  };

  const joinClub = async (clubId) => {
    try {
      const response = await ApiService.joinClub(clubId);
      console.log('✅ Join response:', response.data);
      
      // Update club member count
      setClubs(clubs.map(c => 
        c._id === clubId 
          ? { ...c, communityMembers: (c.communityMembers || 0) + 1 } 
          : c
      ));
      
      // Extract joined clubs from the response
      // Response structure: { data: { user: { joinedClubs: [...] } } }
      const userJoinedClubs = response.data?.data?.user?.joinedClubs || [];
      const joinedClubIds = Array.isArray(userJoinedClubs)
        ? userJoinedClubs.map(c => (typeof c === 'object' ? c._id : c)).filter(Boolean)
        : [];
      
      console.log('🏢 Joined clubs from response:', joinedClubIds);
      
      return { 
        success: true,
        message: 'Successfully joined community!',
        joinedClubs: joinedClubIds
      };
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to join community. Please try again.';
      console.error('Join club error:', errorMessage);
      return { 
        success: false, 
        error: errorMessage
      };
    }
  };

  const leaveClub = async (clubId) => {
    try {
      const response = await ApiService.leaveClub(clubId);
      setClubs(clubs.map(c => 
        c._id === clubId 
          ? { ...c, communityMembers: Math.max(0, (c.communityMembers || 1) - 1) } 
          : c
      ));
      // Reload clubs to get updated member counts
      await fetchClubs();
      return { 
        success: true,
        message: 'Successfully left community!'
      };
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to leave community. Please try again.';
      console.error('Leave club error:', errorMessage);
      return { 
        success: false, 
        error: errorMessage
      };
    }
  };

  return {
    clubs,
    loading,
    error,
    joinClub,
    leaveClub,
    refetch: fetchClubs
  };
};