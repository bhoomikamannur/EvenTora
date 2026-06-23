export const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

export const formatTime = (time) => {
  return new Date(`2000-01-01 ${time}`).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });
};

export const truncate = (str, length) => {
  return str.length > length ? str.substring(0, length) + '...' : str;
};

export const getImageUrl = (imagePath) => {
  if (!imagePath) return null;
  
  // Cloudinary URLs are already full URLs
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }
  
  // Fallback for any local paths (shouldn't happen with Cloudinary)
  const serverUrl = process.env.REACT_APP_SERVER_URL || 'http://localhost:5000';
  return `${serverUrl}/${imagePath}`;
};
