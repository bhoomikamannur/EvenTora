const express = require('express');
const router = express.Router({ mergeParams: true });
const {
  getClubMedia,
  createMedia,
  updateMedia,
  deleteMedia
} = require('../controllers/mediaController');
const { protect, adminOnly } = require('../middleware/auth');

router.route('/')
  .get(getClubMedia)
  .post(protect, adminOnly, createMedia);

router.route('/:id')
  .put(protect, adminOnly, updateMedia)
  .delete(protect, adminOnly, deleteMedia);

module.exports = router;