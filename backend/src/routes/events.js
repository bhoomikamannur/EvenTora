const express = require('express');
const router = express.Router();
const {
  getAllEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
  rsvpEvent,
  cancelRSVP
} = require('../controllers/eventController');
const { protect, adminOnly } = require('../middleware/auth');

router.route('/')
  .get(getAllEvents)
  .post(protect, adminOnly, createEvent);

router.route('/:id')
  .get(getEventById)
  .put(protect, adminOnly, updateEvent)
  .delete(protect, adminOnly, deleteEvent);

router.route('/:id/rsvp')
  .post(protect, rsvpEvent)
  .delete(protect, cancelRSVP);

module.exports = router;