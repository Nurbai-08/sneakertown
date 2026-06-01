import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import {
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
} from 'firebase/auth';
import { auth, googleProvider, isFirebaseEnabled } from './firebase.js';
import { userDataService } from './userDataService.js';
import { mapFirebaseUser, mergeAuthUser } from '../../entities/user/model.js';

const requireFirebase = () => {
  if (!isFirebaseEnabled) {
    throw new Error('Firebase не настроен. Заполните переменные VITE_FIREBASE_* в .env');
  }
};

export const registerUser = createAsyncThunk('auth/registerUser', async ({ email, password, displayName }, { rejectWithValue }) => {
  try {
    requireFirebase();
    const { user } = await createUserWithEmailAndPassword(auth, email, password);
    const name = displayName?.trim() || '';

    if (name) {
      await updateProfile(user, { displayName: name });
    }

    const currentUser = auth.currentUser ?? user;
    const mappedUser = {
      ...mapFirebaseUser(currentUser),
      displayName: name || currentUser.displayName || '',
    };

    userDataService.upsertUser({ ...currentUser, displayName: mappedUser.displayName }).catch(() => {});

    return mappedUser;
  } catch (error) {
    return rejectWithValue(error.message);
  }
});

export const loginUser = createAsyncThunk('auth/loginUser', async ({ email, password }, { rejectWithValue }) => {
  try {
    requireFirebase();
    const { user } = await signInWithEmailAndPassword(auth, email, password);
    userDataService.upsertUser(user).catch(() => {});
    return mapFirebaseUser(user);
  } catch (error) {
    return rejectWithValue(error.message);
  }
});

export const loginWithGoogle = createAsyncThunk('auth/loginWithGoogle', async (_, { rejectWithValue }) => {
  try {
    requireFirebase();
    const { user } = await signInWithPopup(auth, googleProvider);
    userDataService.upsertUser(user).catch(() => {});
    return mapFirebaseUser(user);
  } catch (error) {
    return rejectWithValue(error.message);
  }
});

export const logoutUser = createAsyncThunk('auth/logoutUser', async (_, { rejectWithValue }) => {
  try {
    requireFirebase();
    await signOut(auth);
  } catch (error) {
    return rejectWithValue(error.message);
  }
});

export const resetPassword = createAsyncThunk('auth/resetPassword', async (email, { rejectWithValue }) => {
  try {
    requireFirebase();
    await sendPasswordResetEmail(auth, email);
    return true;
  } catch (error) {
    return rejectWithValue(error.message);
  }
});

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: null,
    isAuthenticated: false,
    loading: false,
    error: null,
    authReady: false,
  },
  reducers: {
    setUser(state, action) {
      state.user = mergeAuthUser(state.user, action.payload);
      state.isAuthenticated = Boolean(state.user);
      state.loading = false;
    },
    setAuthReady(state, action) {
      state.authReady = action.payload;
    },
    clearAuthError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addMatcher((action) => action.type.startsWith('auth/') && action.type.endsWith('/pending'), (state) => {
        state.loading = true;
        state.error = null;
      })
      .addMatcher((action) => action.type.startsWith('auth/') && action.type.endsWith('/fulfilled'), (state, action) => {
        state.loading = false;
        if (action.payload && action.type !== 'auth/resetPassword/fulfilled') {
          state.user = mergeAuthUser(state.user, action.payload);
          state.isAuthenticated = true;
        }
        if (action.type === 'auth/logoutUser/fulfilled') {
          state.user = null;
          state.isAuthenticated = false;
        }
      })
      .addMatcher((action) => action.type.startsWith('auth/') && action.type.endsWith('/rejected'), (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Ошибка авторизации';
      });
  },
});

export const { setUser, setAuthReady, clearAuthError } = authSlice.actions;
export default authSlice.reducer;
