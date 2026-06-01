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
