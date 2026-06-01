export const mapFirebaseUser = (user) =>
  user
    ? {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName || '',
        photoURL: user.photoURL || '',
        createdAt: user.metadata?.creationTime || '',
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
