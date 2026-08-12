import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { applyLeaveApi, getMyLeavesApi, getAllLeavesApi, approveLeaveApi, rejectLeaveApi } from '../../api/index.js';

export const applyLeave     = createAsyncThunk('leave/apply',    async (data, { rejectWithValue }) => {
  try { const { data: d } = await applyLeaveApi(data);       return d.data.leave; } catch (e) { return rejectWithValue(e.response?.data?.message); }
});
export const fetchMyLeaves  = createAsyncThunk('leave/myLeaves', async (_, { rejectWithValue }) => {
  try { const { data } = await getMyLeavesApi();              return data.data; }    catch (e) { return rejectWithValue(e.response?.data?.message); }
});
export const fetchAllLeaves = createAsyncThunk('leave/all',      async (params, { rejectWithValue }) => {
  try { const { data } = await getAllLeavesApi(params);        return data.data; }   catch (e) { return rejectWithValue(e.response?.data?.message); }
});
export const approveLeave   = createAsyncThunk('leave/approve',  async ({ id, note }, { rejectWithValue }) => {
  try { const { data } = await approveLeaveApi(id, { note }); return data.data.leave; } catch (e) { return rejectWithValue(e.response?.data?.message); }
});
export const rejectLeave    = createAsyncThunk('leave/reject',   async ({ id, note }, { rejectWithValue }) => {
  try { const { data } = await rejectLeaveApi(id, { note });  return data.data.leave; } catch (e) { return rejectWithValue(e.response?.data?.message); }
});

const leaveSlice = createSlice({
  name: 'leaves',
  initialState: { myLeaves: [], allLeaves: [], leaveBalance: {}, loading: false, error: null },
  reducers: {},
  extraReducers: (b) => {
    b
      .addCase(applyLeave.fulfilled,     (s, { payload }) => { s.myLeaves.unshift(payload); })
      .addCase(fetchMyLeaves.fulfilled,  (s, { payload }) => { s.myLeaves = payload.leaves; s.leaveBalance = payload.leaveBalance; })
      .addCase(fetchAllLeaves.pending,   (s) => { s.loading = true; })
      .addCase(fetchAllLeaves.fulfilled, (s, { payload }) => { s.loading = false; s.allLeaves = payload.leaves; })
      .addCase(fetchAllLeaves.rejected,  (s) => { s.loading = false; })
      .addCase(approveLeave.fulfilled,   (s, { payload }) => {
        const i = s.allLeaves.findIndex(l => l._id === payload._id); if (i !== -1) s.allLeaves[i] = payload;
      })
      .addCase(rejectLeave.fulfilled,    (s, { payload }) => {
        const i = s.allLeaves.findIndex(l => l._id === payload._id); if (i !== -1) s.allLeaves[i] = payload;
      });
  },
});
export default leaveSlice.reducer;
