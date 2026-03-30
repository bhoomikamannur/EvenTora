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
      console.log('📡 API: Joining club', clubId);
      const response = await ApiService.joinClub(clubId);
      console.log('📡 API Response:', response.data);
      
      setClubs(clubs.map(c => 
        c._id === clubId 
          ? { ...c, communityMembers: (c.communityMembers || 0) + 1 } 
          : c
      ));
      
      return { 
        success: true,
        data: response.data
      };
    } catch (err) {
      console.error('❌ Join club error:', err.response?.data || err.message);
      return { 
        success: false, 
        error: err.response?.data?.message || 'Failed to join club' 
      };
    }
  };

  const leaveClub = async (clubId) => {
    try {
      await ApiService.leaveClub(clubId);
      setClubs(clubs.map(c => 
        c._id === clubId 
          ? { ...c, communityMembers: Math.max(0, c.communityMembers - 1) } 
          : c
      ));
      return { success: true };
    } catch (err) {
      return { 
        success: false, 
        error: err.response?.data?.message || 'Failed to leave club' 
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