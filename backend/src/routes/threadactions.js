const express = require('express');
const router = express.Router();
const {
  likeThread,
  reportThread,
  deleteThread,
  dismissReport,
  addReply,
  likeReply,
  reportReply,
  deleteReply
} = require('../controllers/threadController');
const { protect, adminOnly } = require('../middleware/auth');

// Thread actions (these routes start with /api/threads/:id)
router.post('/:id/like', protect, likeThread);
router.post('/:id/report', protect, reportThread);
router.post('/:id/dismiss-report', protect, adminOnly, dismissReport);
router.delete('/:id', protect, deleteThread);

// Reply actions (these routes start with /api/threads/:id/reply)
router.post('/:id/reply', protect, addReply);
router.post('/:threadId/reply/:replyId/like', protect, likeReply);
router.post('/:threadId/reply/:replyId/report', protect, reportReply);
router.delete('/:threadId/reply/:replyId', protect, deleteReply);

module.exports = router;