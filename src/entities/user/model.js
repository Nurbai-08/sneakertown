const apiBaseUrl = import.meta.env.VITE_API_URL || '/api';

const resolvePhotoUrl = (photoUrl) => {
  if (!photoUrl || !photoUrl.startsWith('/') || !/^https?:\/\//.test(apiBaseUrl)) return photoUrl || '';
  return new URL(photoUrl, apiBaseUrl).toString();
};

export const mapApiUser = (user) =>
  user
    ? {
        uid: user.uid,
        email: user.email || '',
        displayName: user.displayName || '',
        photoURL: resolvePhotoUrl(user.photoURL),
        role: user.role || 'user',
        createdAt: user.createdAt || '',
      }
    : null;

export const mergeAuthUser = (prev, next) => {
  if (!next) return null;
  if (!prev || prev.uid !== next.uid) return next;
  return {
    ...next,
    displayName: next.displayName || prev.displayName || '',
    photoURL: next.photoURL || prev.photoURL || '',
    email: next.email || prev.email || '',
    createdAt: next.createdAt || prev.createdAt || '',
  };
};
