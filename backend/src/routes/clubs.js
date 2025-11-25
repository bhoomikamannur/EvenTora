const express = require('express');
const router = express.Router();
const {
  getAllClubs,
  getClubById,
  createClub,
  updateClub,
  deleteClub,
  joinClub,
  leaveClub
} = require('../controllers/clubController');
const { protect, adminOnly } = require('../middleware/auth');

router.route('/')
  .get(getAllClubs)
  .post(protect, adminOnly, createClub);

router.route('/:id')
  .get(getClubById)
  .put(protect, adminOnly, updateClub)
  .delete(protect, adminOnly, deleteClub);

router.post('/:id/join', protect, joinClub);
router.post('/:id/leave', protect, leaveClub);

module.exports = router;