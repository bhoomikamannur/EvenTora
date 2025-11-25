const Media = require('../models/Media');

// @desc    Get all media for a club
// @route   GET /api/clubs/:clubId/media
// @access  Public
exports.getClubMedia = async (req, res) => {
  try {
    const media = await Media.find({ clubId: req.params.clubId })
      .sort({ createdAt: -1 });
    
    res.json(media);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create media
// @route   POST /api/clubs/:clubId/media
// @access  Private/Admin
exports.createMedia = async (req, res) => {
  try {
    const { title, description, type, link, thumbnail } = req.body;
    
    const media = await Media.create({
      clubId: req.params.clubId,
      title,
      description,
      type,
      link,
      thumbnail: thumbnail || `https://via.placeholder.com/400x300?text=${encodeURIComponent(title)}`
    });
    
    res.status(201).json(media);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Update media
// @route   PUT /api/clubs/:clubId/media/:id
// @access  Private/Admin
exports.updateMedia = async (req, res) => {
  try {
    const media = await Media.findOne({
      _id: req.params.id,
      clubId: req.params.clubId
    });
    
    if (!media) {
      return res.status(404).json({ message: 'Media not found' });
    }

    const updatedMedia = await Media.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    res.json(updatedMedia);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Delete media
// @route   DELETE /api/clubs/:clubId/media/:id
// @access  Private/Admin
exports.deleteMedia = async (req, res) => {
  try {
    const media = await Media.findOneAndDelete({
      _id: req.params.id,
      clubId: req.params.clubId
    });
    
    if (!media) {
      return res.status(404).json({ message: 'Media not found' });
    }
    
    res.json({ message: 'Media deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};