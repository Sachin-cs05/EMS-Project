import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

import {
  getDashboardStatsApi,
  getDashboardChartsApi,
  getRecentActivityApi,
} from '../../api/index.js';

export const fetchDashboardStats = createAsyncThunk(
  'dashboard/stats',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await getDashboardStatsApi();
      return data.data;
    } catch (e) {
      return rejectWithValue(
        e.response?.data?.message || 'Failed to fetch dashboard stats'
      );
    }
  }
);

export const fetchDashboardCharts = createAsyncThunk(
  'dashboard/charts',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await getDashboardChartsApi();
      return data.data;
    } catch (e) {
      return rejectWithValue(
        e.response?.data?.message || 'Failed to fetch dashboard charts'
      );
    }
  }
);

export const fetchRecentActivity = createAsyncThunk(
  'dashboard/recentActivity',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await getRecentActivityApi();
      return data.data;
    } catch (e) {
      return rejectWithValue(
        e.response?.data?.message || 'Failed to fetch recent activity'
      );
    }
  }
);

const dashboardSlice = createSlice({
  name: 'dashboard',

  initialState: {
    stats: null,
    charts: null,
    recentActivity: null,
    loading: false,
    error: null,
  },

  reducers: {},

  extraReducers: (builder) => {
    builder

      .addCase(fetchDashboardStats.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(fetchDashboardStats.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.stats = payload;
      })

      .addCase(fetchDashboardStats.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload;
      })

      .addCase(fetchDashboardCharts.fulfilled, (state, { payload }) => {
        state.charts = payload;
      })

      .addCase(fetchDashboardCharts.rejected, (state, { payload }) => {
        state.error = payload;
      })

      .addCase(fetchRecentActivity.fulfilled, (state, { payload }) => {
        state.recentActivity = payload;
      })

      .addCase(fetchRecentActivity.rejected, (state, { payload }) => {
        state.error = payload;
      });
  },
});

export default dashboardSlice.reducer;