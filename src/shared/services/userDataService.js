import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { db, isFirebaseEnabled, storage } from './firebase.js';

export const userDataService = {
  async upsertUser(user) {
    if (!isFirebaseEnabled || !user) return;
    const payload = {
      uid: user.uid,
      email: user.email,
      createdAt: user.metadata?.creationTime || serverTimestamp(),
    };
    if (user.displayName) payload.displayName = user.displayName;
    if (user.photoURL) payload.photoURL = user.photoURL;
    await setDoc(doc(db, 'users', user.uid), payload, { merge: true });
  },
  async getUserProfile(uid) {
    if (!isFirebaseEnabled || !uid) return null;
    const snap = await getDoc(doc(db, 'users', uid));
    return snap.exists() ? snap.data() : null;
  },
  async getUserCollection(collectionName, uid) {
    if (!isFirebaseEnabled || !uid) return [];
    const snap = await getDoc(doc(db, collectionName, uid));
    return snap.exists() ? snap.data().items || [] : [];
  },
  async saveUserCollection(collectionName, uid, items) {
    if (!isFirebaseEnabled || !uid) return;
    await setDoc(
      doc(db, collectionName, uid),
      {
        userId: uid,
        items,
        updatedAt: serverTimestamp(),
      },
      { merge: true },
    );
  },
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/avif'],
  MAX_AVATAR_SIZE: 5 * 1024 * 1024,

  async uploadAvatar(uid, file) {
    if (!isFirebaseEnabled || !uid || !file) return '';

    if (!this.ALLOWED_IMAGE_TYPES.includes(file.type)) {
      throw new Error('Допустимы только изображения: JPG, PNG, GIF, WebP, AVIF');
    }

    if (file.size > this.MAX_AVATAR_SIZE) {
      throw new Error('Размер файла не должен превышать 5 МБ');
    }

    const ext = file.name.split('.').pop().toLowerCase();
    const safeName = `${uid}_${Date.now()}.${ext}`;
    const avatarRef = ref(storage, `avatars/${uid}/${safeName}`);
    await uploadBytes(avatarRef, file);
    return getDownloadURL(avatarRef);
  },
};
