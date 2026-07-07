import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

export const isFirebaseEnabled = Object.values(firebaseConfig).every(Boolean);
export const firebaseApp = isFirebaseEnabled ? initializeApp(firebaseConfig) : null;

export const auth = firebaseApp ? getAuth(firebaseApp) : null;
export const db = firebaseApp ? getFirestore(firebaseApp) : null;
export const storage = firebaseApp ? getStorage(firebaseApp) : null;
export const googleProvider = new GoogleAuthProvider();

export const FIREBASE_ERRORS = {
  'auth/user-not-found': 'Пользователь с таким email не найден',
  'auth/wrong-password': 'Неверный пароль',
  'auth/invalid-credential': 'Неверный email или пароль',
  'auth/email-already-in-use': 'Этот email уже зарегистрирован',
  'auth/weak-password': 'Пароль должен содержать минимум 8 символов',
  'auth/invalid-email': 'Некорректный email',
  'auth/too-many-requests': 'Слишком много попыток. Попробуйте позже',
  'auth/user-disabled': 'Аккаунт заблокирован',
  'auth/operation-not-allowed': 'Вход через Google временно недоступен',
  'auth/popup-closed-by-user': 'Окно авторизации было закрыто',
  'auth/cancelled-popup-request': 'Повторный запрос отменён',
  'auth/network-request-failed': 'Ошибка сети. Проверьте подключение',
  'auth/requires-recent-login': 'Пожалуйста, выйдите и войдите снова',
  'auth/account-exists-with-different-credential': 'Этот email уже используется другим способом входа',
};

export const mapFirebaseError = (error) => {
  if (!error) return 'Неизвестная ошибка';
  const code = error.code || error;
  return FIREBASE_ERRORS[code] || 'Произошла ошибка. Попробуйте позже';
};
