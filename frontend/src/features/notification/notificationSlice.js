import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

import {
  getNotificationsApi,
  markReadApi,
  markAllReadApi,
} from '../../api/index.js';

export const fetchNotifications = createAsyncThunk(
  'notifications/fetch',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await getNotificationsApi();
      return data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          'Failed to fetch notifications'
      );
    }
  }
);

export const markRead = createAsyncThunk(
  'notifications/markRead',
  async (id, { rejectWithValue }) => {
    try {
      await markReadApi(id);
      return id;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          'Failed to mark notification as read'
      );
    }
  }
);

export const markAllRead = createAsyncThunk(
  'notifications/markAllRead',
  async (_, { rejectWithValue }) => {
    try {
      await markAllReadApi();
      return true;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          'Failed to mark all notifications as read'
      );
    }
  }
);

const notificationSlice = createSlice({
  name: 'notifications',

  initialState: {
    list: [],
    unreadCount: 0,
    loading: false,
    error: null,
  },

  reducers: {},

  extraReducers: (builder) => {
    builder

      // Fetch notifications
      .addCase(fetchNotifications.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload?.notifications || [];
        state.unreadCount = action.payload?.unreadCount || 0;
      })

      .addCase(fetchNotifications.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.payload || 'Failed to fetch notifications';
      })

      // Mark single notification as read
      .addCase(markRead.fulfilled, (state, action) => {
        const notification = state.list.find(
          (item) => item._id === action.payload
        );

        if (notification && !notification.isRead) {
          notification.isRead = true;

          state.unreadCount = Math.max(
            0,
            state.unreadCount - 1
          );
        }
      })

      .addCase(markRead.rejected, (state, action) => {
        state.error =
          action.payload || 'Failed to mark notification as read';
      })

      // Mark all as read
      .addCase(markAllRead.fulfilled, (state) => {
        state.list.forEach((notification) => {
          notification.isRead = true;
        });

        state.unreadCount = 0;
      })

      .addCase(markAllRead.rejected, (state, action) => {
        state.error =
          action.payload ||
          'Failed to mark all notifications as read';
      });
  },
});

export default notificationSlice.reducer;