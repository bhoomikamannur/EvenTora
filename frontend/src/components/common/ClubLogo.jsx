import React from 'react';

const ClubLogo = ({ club, size = 48, className = '', rounded = 'rounded-full' }) => {
  const logo = club?.logo;
  const isImageUrl = typeof logo === 'string' && /^https?:\/\//.test(logo);

  const style = { width: size, height: size };

  if (isImageUrl) {
    return (
      <img
        src={logo}
        alt={club?.name ? `${club.name} logo` : 'Club logo'}
        style={style}
        className={`${rounded} object-cover flex-shrink-0 ${className}`}
      />
    );
  }

  return (
    <div
      style={{ ...style, background: club?.color || '#ab83c3', fontSize: size * 0.5 }}
      className={`${rounded} flex items-center justify-center flex-shrink-0 ${className}`}
    >
      {logo || '🎯'}
    </div>
  );
};

export default ClubLogo;
