const express = require('express');
const router = express.Router({ mergeParams: true });
const {
  getClubMembers,
  addMember,
  updateMember,
  deleteMember
} = require('../controllers/memberController');
const { protect, adminOnly } = require('../middleware/auth');

router.route('/')
  .get(getClubMembers)
  .post(protect, adminOnly, addMember);

router.route('/:id')
  .put(protect, adminOnly, updateMember)
  .delete(protect, adminOnly, deleteMember);

module.exports = router;