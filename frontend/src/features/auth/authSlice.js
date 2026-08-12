import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { loginApi, getMeApi, logoutApi } from '../../api/index.js';

const TOKEN_KEY = 'ems_token';
const USER_KEY  = 'ems_user';

export const loginThunk = createAsyncThunk('auth/login', async (credentials, { rejectWithValue }) => {
  try {
    const { data } = await loginApi(credentials);
    localStorage.setItem(TOKEN_KEY, data.data.token);
    localStorage.setItem(USER_KEY,  JSON.stringify(data.data.user));
    return data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Login failed');
  }
});

export const getMeThunk = createAsyncThunk('auth/getMe', async (_, { rejectWithValue }) => {
  try {
    const { data } = await getMeApi();
    return data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to fetch profile');
  }
});

export const logoutThunk = createAsyncThunk('auth/logout', async () => {
  try { await logoutApi(); } catch (_) {}
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
});

const storedUser = (() => {
  try { return JSON.parse(localStorage.getItem(USER_KEY)); } catch { return null; }
})();

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user:     storedUser || null,
    employee: null,
    token:    localStorage.getItem(TOKEN_KEY) || null,
    loading:  false,
    error:    null,
  },
  reducers: {
    clearError: (state) => { state.error = null; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginThunk.pending,    (state) => { state.loading = true; state.error = null; })
      .addCase(loginThunk.fulfilled,  (state, { payload }) => {
        state.loading = false; state.user = payload.user;
        state.employee = payload.employee; state.token = payload.token;
      })
      .addCase(loginThunk.rejected,   (state, { payload }) => { state.loading = false; state.error = payload; })
      .addCase(getMeThunk.fulfilled,  (state, { payload }) => { state.user = payload.user; state.employee = payload.employee; })
      .addCase(logoutThunk.fulfilled, (state) => { state.user = null; state.employee = null; state.token = null; });
  },
});

export const { clearError } = authSlice.actions;
export default authSlice.reducer;
