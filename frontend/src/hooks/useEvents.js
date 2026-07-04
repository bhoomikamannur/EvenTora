import { useState, useEffect } from 'react';
import ApiService from '../services/api';

export const useEvents = (clubId = null) => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchEvents();
  }, [clubId]);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const params = clubId ? { clubId } : {};
      const response = await ApiService.getEvents(params);
      // Extract data array from new API response format
      const eventsArray = response.data?.data || response.data || [];
      setEvents(Array.isArray(eventsArray) ? eventsArray : []);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch events');
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  const createEvent = async (data) => {
    try {
      const response = await ApiService.createEvent(data);
      const eventData = response.data?.data || response.data;
      setEvents([...events, eventData]);
      return { success: true, data: eventData };
    } catch (err) {
      return { 
        success: false, 
        error: err.response?.data?.message || 'Failed to create event' 
      };
    }
  };

  const updateEvent = async (id, data) => {
    try {
      const response = await ApiService.updateEvent(id, data);
      const eventData = response.data?.data || response.data;
      setEvents(events.map(e => e._id === id ? eventData : e));
      return { success: true, data: eventData };
    } catch (err) {
      return { 
        success: false, 
        error: err.response?.data?.message || 'Failed to update event' 
      };
    }
  };

  const deleteEvent = async (id) => {
    try {
      await ApiService.deleteEvent(id);
      setEvents(events.filter(e => e._id !== id));
      return { success: true };
    } catch (err) {
      return { 
        success: false, 
        error: err.response?.data?.message || 'Failed to delete event' 
      };
    }
  };

  const rsvpEvent = async (id) => {
    try {
      const response = await ApiService.rsvpEvent(id);
      // Backend wraps payload in { success, message, data }, so the
      // updated rsvp count lives at response.data.data.rsvps, not
      // response.data.rsvps.
      const rsvpData = response.data?.data || response.data;
      setEvents(prevEvents => prevEvents.map(e => {
        if (e._id === id) {
          return {
            ...e,
            rsvps: rsvpData.rsvps,
            hasRSVPd: true
          };
        }
        return e;
      }));
      return { success: true, data: rsvpData };
    } catch (err) {
      return { 
        success: false, 
        error: err.response?.data?.message || 'Failed to RSVP' 
      };
    }
  };

  const cancelRsvpEvent = async (id) => {
    try {
      const response = await ApiService.cancelRSVP(id);
      const rsvpData = response.data?.data || response.data;
      setEvents(prevEvents => prevEvents.map(e => {
        if (e._id === id) {
          return {
            ...e,
            rsvps: rsvpData.rsvps,
            hasRSVPd: false
          };
        }
        return e;
      }));
      return { success: true, data: rsvpData };
    } catch (err) {
      return {
        success: false,
        error: err.response?.data?.message || 'Failed to cancel RSVP'
      };
    }
  };

  const applyRsvpBroadcast = (eventId, rsvps) => {
    setEvents(prevEvents => prevEvents.map(e =>
      e._id === eventId ? { ...e, rsvps } : e
    ));
  };

  return {
    events,
    loading,
    error,
    createEvent,
    updateEvent,
    deleteEvent,
    rsvpEvent,
    cancelRsvpEvent,
    applyRsvpBroadcast,
    refetch: fetchEvents
  };
};