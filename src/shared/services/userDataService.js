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
  async uploadAvatar(uid, file) {
    if (!isFirebaseEnabled || !uid || !file) return '';
    const avatarRef = ref(storage, `avatars/${uid}/${file.name}`);
    await uploadBytes(avatarRef, file);
    return getDownloadURL(avatarRef);
  },
};
