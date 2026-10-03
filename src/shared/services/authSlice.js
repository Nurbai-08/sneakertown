import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { mapApiUser, mergeAuthUser } from '../../entities/user/model.js';
import { authApi, getApiErrorMessage } from './api.js';

const AUTH_RATE_LIMIT_WINDOW = 2000;
const authThrottle = new Map();

const checkThrottle = (key) => {
  const now = Date.now();
  const last = authThrottle.get(key) || 0;
  if (now - last < AUTH_RATE_LIMIT_WINDOW) throw new Error('Слишком много попыток. Попробуйте позже');
  authThrottle.set(key, now);
};

export const restoreSession = createAsyncThunk('auth/restoreSession', async (_, { rejectWithValue }) => {
  try {
    const session = await authApi.refresh();
    return mapApiUser(session.user);
  } catch {
    return rejectWithValue(null);
  }
});

export const registerUser = createAsyncThunk('auth/registerUser', async (payload, { rejectWithValue }) => {
  try {
    checkThrottle('register');
    const session = await authApi.register(payload);
    return mapApiUser(session.user);
  } catch (error) {
    return rejectWithValue(getApiErrorMessage(error, error.message));
  }
});

export const loginUser = createAsyncThunk('auth/loginUser', async (payload, { rejectWithValue }) => {
  try {
    checkThrottle('login');
    const session = await authApi.login(payload);
    return mapApiUser(session.user);
  } catch (error) {
    return rejectWithValue(getApiErrorMessage(error, error.message));
  }
});

export const loginWithGoogle = createAsyncThunk('auth/loginWithGoogle', async (_, { rejectWithValue }) => {
  try {
    checkThrottle('google');
    window.location.assign(authApi.getGoogleLoginUrl());
    return null;
  } catch (error) {
    return rejectWithValue(getApiErrorMessage(error, error.message));
  }
});

export const logoutUser = createAsyncThunk('auth/logoutUser', async () => {
  try {
    await authApi.logout();
  } catch {
    // Локальный выход должен сработать, даже если API временно недоступен.
  }
  return null;
});

export const resetPassword = createAsyncThunk('auth/resetPassword', async (email, { rejectWithValue }) => {
  try {
    checkThrottle('reset');
    await authApi.forgotPassword(email);
    return true;
  } catch (error) {
    return rejectWithValue(getApiErrorMessage(error));
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
    setAuthError(state, action) {
      state.error = action.payload;
      state.loading = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(restoreSession.pending, (state) => {
        state.authReady = false;
      })
      .addCase(restoreSession.fulfilled, (state, action) => {
        state.user = action.payload;
        state.isAuthenticated = Boolean(action.payload);
        state.authReady = true;
      })
      .addCase(restoreSession.rejected, (state) => {
        state.user = null;
        state.isAuthenticated = false;
        state.authReady = true;
      })
      .addMatcher(
        (action) => action.type.startsWith('auth/') && action.type.endsWith('/pending') && action.type !== restoreSession.pending.type,
        (state) => {
          state.loading = true;
          state.error = null;
        },
      )
      .addMatcher(
        (action) => action.type.startsWith('auth/') && action.type.endsWith('/fulfilled') && action.type !== restoreSession.fulfilled.type,
        (state, action) => {
          state.loading = false;
          if (action.payload && action.type !== resetPassword.fulfilled.type) {
            state.user = mergeAuthUser(state.user, action.payload);
            state.isAuthenticated = true;
          }
          if (action.type === logoutUser.fulfilled.type) {
            state.user = null;
            state.isAuthenticated = false;
          }
        },
      )
      .addMatcher(
        (action) => action.type.startsWith('auth/') && action.type.endsWith('/rejected') && action.type !== restoreSession.rejected.type,
        (state, action) => {
          state.loading = false;
          state.error = action.payload || 'Ошибка авторизации';
        },
      );
  },
});

export const { setUser, setAuthReady, clearAuthError, setAuthError } = authSlice.actions;
export default authSlice.reducer;
