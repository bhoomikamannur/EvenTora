const Event = require('../models/Event');
const User = require('../models/User');
const Club = require('../models/Club');

// @desc    Get all events
// @route   GET /api/events
// @access  Public
exports.getAllEvents = async (req, res) => {
  try {
    const { clubId, date, month } = req.query;
    
    let query = {};
    
    if (clubId) {
      query.clubId = clubId;
    }
    
    if (date) {
      query.date = date;
    }
    
    if (month) {
      // Match events in specific month (format: YYYY-MM)
      query.date = { $regex: `^${month}` };
    }

    const events = await Event.find(query)
      .populate('clubId', 'name logo color')
      .sort({ date: 1, time: 1 });
    
    res.json(events);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single event
// @route   GET /api/events/:id
// @access  Public
exports.getEventById = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate('clubId', 'name logo color');
    
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    
    res.json(event);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create event
// @route   POST /api/events
// @access  Private/Admin
exports.createEvent = async (req, res) => {
  try {
    const { clubId, title, description, venue, date, time, isAcademic } = req.body;
    
    const event = await Event.create({
      clubId,
      title,
      description,
      venue,
      date,
      time,
      isAcademic: isAcademic || false
    });

    const populatedEvent = await Event.findById(event._id)
      .populate('clubId', 'name logo color');
    
    res.status(201).json(populatedEvent);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Update event
// @route   PUT /api/events/:id
// @access  Private/Admin
exports.updateEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    const updatedEvent = await Event.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('clubId', 'name logo color');
    
    res.json(updatedEvent);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Delete event
// @route   DELETE /api/events/:id
// @access  Private/Admin
exports.deleteEvent = async (req, res) => {
  try {
    const event = await Event.findByIdAndDelete(req.params.id);
    
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    
    res.json({ message: 'Event deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    RSVP to event
// @route   POST /api/events/:id/rsvp
// @access  Private
exports.rsvpEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    const user = await User.findById(req.user._id);
    
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    
    const userIdString = req.user._id.toString();
    const hasRSVPd = event.rsvpList.some(id => id.toString() === userIdString);
    
    if (hasRSVPd) {
      return res.status(400).json({ message: 'Already RSVP\'d to this event' });
    }
    
    // Add RSVP
    event.rsvps += 1;
    event.rsvpList.push(req.user._id);
    user.rsvpEvents.push(event._id);
    
    await event.save();
    await user.save();
    
    res.json({ 
      message: 'RSVP successful',
      rsvps: event.rsvps
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Cancel RSVP
// @route   DELETE /api/events/:id/rsvp
// @access  Private
exports.cancelRSVP = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    const user = await User.findById(req.user._id);
    
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    
    const userIdString = req.user._id.toString();
    const hasRSVPd = event.rsvpList.some(id => id.toString() === userIdString);
    
    if (!hasRSVPd) {
      return res.status(400).json({ message: 'Haven\'t RSVP\'d to this event' });
    }
    
    // Remove RSVP
    event.rsvps = Math.max(0, event.rsvps - 1);
    event.rsvpList = event.rsvpList.filter(id => id.toString() !== userIdString);
    user.rsvpEvents = user.rsvpEvents.filter(id => id.toString() !== event._id.toString());
    
    await event.save();
    await user.save();
    
    res.json({ 
      message: 'RSVP cancelled',
      rsvps: event.rsvps
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};