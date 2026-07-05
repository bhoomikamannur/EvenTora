import React from 'react';

const UserAvatar = ({ user, name, avatar, size = 40, className = '' }) => {
  const resolvedName = name || user?.name || user?.username || '?';
  const resolvedAvatar = avatar !== undefined ? avatar : user?.avatar;
  const isImageUrl = typeof resolvedAvatar === 'string' && /^https?:\/\//.test(resolvedAvatar);

  const style = { width: size, height: size, fontSize: size * 0.4 };

  if (isImageUrl) {
    return (
      <img
        src={resolvedAvatar}
        alt={resolvedName}
        style={style}
        className={`rounded-full object-cover flex-shrink-0 ${className}`}
      />
    );
  }

  return (
    <div
      style={{ ...style, background: 'linear-gradient(135deg, #6B4A63 0%, #E8A33D 100%)' }}
      className={`rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0 ${className}`}
    >
      {resolvedName.charAt(0).toUpperCase()}
    </div>
  );
};

export default UserAvatar;