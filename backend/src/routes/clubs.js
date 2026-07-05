const express = require('express');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
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
const { protect, adminOnly, organizerOnly } = require('../middleware/auth');

// Configure Cloudinary (same account/config as post images)
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Configure multer with Cloudinary storage for club logos
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'eventora/clubs',
    allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
    transformation: [
      { width: 400, height: 400, crop: 'limit', quality: 'auto' }
    ]
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

router.route('/')
  .get(getAllClubs)
  .post(protect, organizerOnly, upload.single('logo'), createClub);

router.route('/:id')
  .get(getClubById)
  .put(protect, adminOnly, upload.single('logo'), updateClub)
  .delete(protect, organizerOnly, deleteClub);

router.post('/:id/join', protect, joinClub);
router.post('/:id/leave', protect, leaveClub);

module.exports = router;