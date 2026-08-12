import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { checkInApi, checkOutApi, getTodayAttendanceApi, getMyAttendanceApi, getAllAttendanceApi } from '../../api/index.js';

export const checkIn            = createAsyncThunk('att/checkIn',   async (_, { rejectWithValue }) => {
  try { const { data } = await checkInApi();            return data.data.attendance; } catch (e) { return rejectWithValue(e.response?.data?.message); }
});
export const checkOut           = createAsyncThunk('att/checkOut',  async (_, { rejectWithValue }) => {
  try { const { data } = await checkOutApi();           return data.data.attendance; } catch (e) { return rejectWithValue(e.response?.data?.message); }
});
export const fetchTodayAtt      = createAsyncThunk('att/today',     async (_, { rejectWithValue }) => {
  try { const { data } = await getTodayAttendanceApi(); return data.data.attendance; } catch (e) { return rejectWithValue(e.response?.data?.message); }
});
export const fetchMyAttendance  = createAsyncThunk('att/myHistory', async (params, { rejectWithValue }) => {
  try { const { data } = await getMyAttendanceApi(params); return data.data.records; } catch (e) { return rejectWithValue(e.response?.data?.message); }
});
export const fetchAllAttendance = createAsyncThunk('att/all',       async (params, { rejectWithValue }) => {
  try { const { data } = await getAllAttendanceApi(params); return data.data; }        catch (e) { return rejectWithValue(e.response?.data?.message); }
});

const attSlice = createSlice({
  name: 'attendance',
  initialState: { today: null, myHistory: [], allRecords: [], loading: false, error: null },
  reducers: {},
  extraReducers: (b) => {
    b
      .addCase(fetchTodayAtt.fulfilled,     (s, { payload }) => { s.today = payload; })
      .addCase(checkIn.fulfilled,           (s, { payload }) => { s.today = payload; })
      .addCase(checkOut.fulfilled,          (s, { payload }) => { s.today = payload; })
      .addCase(fetchMyAttendance.pending,   (s) => { s.loading = true; })
      .addCase(fetchMyAttendance.fulfilled, (s, { payload }) => { s.loading = false; s.myHistory = payload; })
      .addCase(fetchMyAttendance.rejected,  (s) => { s.loading = false; })
      .addCase(fetchAllAttendance.pending,  (s) => { s.loading = true; })
      .addCase(fetchAllAttendance.fulfilled,(s, { payload }) => { s.loading = false; s.allRecords = payload.records; })
      .addCase(fetchAllAttendance.rejected, (s) => { s.loading = false; });
  },
});
export default attSlice.reducer;
