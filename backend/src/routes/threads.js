const express = require('express');
const router = express.Router({ mergeParams: true });
const {
  getClubThreads,
  getReportedThreads,
  createThread,
  likeThread,
  addReply,
  likeReply,
  reportThread
} = require('../controllers/threadController');
const { protect, adminOnly } = require('../middleware/auth');

// Club threads routes (these routes start with /api/clubs/:clubId/threads)
router.route('/')
  .get(protect, getClubThreads)
  .post(protect, createThread);

// Get reported threads (Admin only)
router.get('/reported', protect, adminOnly, getReportedThreads);

// Thread like/unlike routes
router.post('/:id/like', protect, likeThread);

// Thread reply routes
router.post('/:id/reply', protect, addReply);

// Reply like/unlike routes
router.post('/:threadId/reply/:replyId/like', protect, likeReply);

// Thread report routes
router.post('/:id/report', protect, reportThread);

module.exports = router;