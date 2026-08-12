import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getNotificationsApi, markReadApi, markAllReadApi } from '../../api/index.js';

export const fetchNotifications = createAsyncThunk('notif/fetch',   async (_, { rejectWithValue }) => {
  try { const { data } = await getNotificationsApi(); return data.data; } catch (e) { return rejectWithValue(e.response?.data?.message); }
});
export const markRead    = createAsyncThunk('notif/markOne', async (id, { rejectWithValue }) => {
  try { await markReadApi(id); return id; } catch (e) { return rejectWithValue(e.response?.data?.message); }
});
export const markAllRead = createAsyncThunk('notif/markAll', async (_, { rejectWithValue }) => {
  try { await markAllReadApi(); } catch (e) { return rejectWithValue(e.response?.data?.message); }
});

const notifSlice = createSlice({
  name: 'notifications',
  initialState: { list: [], unreadCount: 0, loading: false },
  reducers: {},
  extraReducers: (b) => {
    b
      .addCase(fetchNotifications.fulfilled, (s, { payload }) => { s.list = payload.notifications; s.unreadCount = payload.unreadCount; })
      .addCase(markRead.fulfilled,    (s, { payload }) => {
        const n = s.list.find(n => n._id === payload);
        if (n && !n.isRead) { n.isRead = true; s.unreadCount = Math.max(0, s.unreadCount - 1); }
      })
      .addCase(markAllRead.fulfilled, (s) => { s.list.forEach(n => { n.isRead = true; }); s.unreadCount = 0; });
  },
});
export default notifSlice.reducer;
