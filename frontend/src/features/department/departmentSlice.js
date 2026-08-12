import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getDepartmentsApi, createDeptApi, updateDeptApi, deleteDeptApi } from '../../api/index.js';

export const fetchDepartments = createAsyncThunk('dept/fetchAll', async (_, { rejectWithValue }) => {
  try { const { data } = await getDepartmentsApi(); return data.data.departments; }
  catch (err) { return rejectWithValue(err.response?.data?.message); }
});
export const createDepartment = createAsyncThunk('dept/create', async (body, { rejectWithValue }) => {
  try { const { data } = await createDeptApi(body); return data.data.department; }
  catch (err) { return rejectWithValue(err.response?.data?.message); }
});
export const updateDepartment = createAsyncThunk('dept/update', async ({ id, body }, { rejectWithValue }) => {
  try { const { data } = await updateDeptApi(id, body); return data.data.department; }
  catch (err) { return rejectWithValue(err.response?.data?.message); }
});
export const deleteDepartment = createAsyncThunk('dept/delete', async (id, { rejectWithValue }) => {
  try { await deleteDeptApi(id); return id; }
  catch (err) { return rejectWithValue(err.response?.data?.message); }
});

const deptSlice = createSlice({
  name: 'departments',
  initialState: { list: [], loading: false, error: null },
  reducers: {},
  extraReducers: (b) => {
    b
      .addCase(fetchDepartments.pending,   (s) => { s.loading = true; })
      .addCase(fetchDepartments.fulfilled, (s, { payload }) => { s.loading = false; s.list = payload; })
      .addCase(fetchDepartments.rejected,  (s, { payload }) => { s.loading = false; s.error = payload; })
      .addCase(createDepartment.fulfilled, (s, { payload }) => { s.list.push(payload); })
      .addCase(updateDepartment.fulfilled, (s, { payload }) => {
        const i = s.list.findIndex(d => d._id === payload._id);
        if (i !== -1) s.list[i] = payload;
      })
      .addCase(deleteDepartment.fulfilled, (s, { payload }) => { s.list = s.list.filter(d => d._id !== payload); });
  },
});
export default deptSlice.reducer;
