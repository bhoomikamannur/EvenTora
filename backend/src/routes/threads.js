const express = require('express');
const router = express.Router({ mergeParams: true });
const {
  getClubThreads,
  createThread,
  addReply,
  deleteThread
} = require('../controllers/threadController');
const { protect } = require('../middleware/auth');

router.route('/')
  .get(protect, getClubThreads)
  .post(protect, createThread);

router.post('/:id/reply', protect, addReply);
router.delete('/:id', protect, deleteThread);

module.exports = router;