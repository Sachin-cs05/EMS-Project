import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getEmployeesApi, getEmployeeApi, createEmployeeApi, updateEmployeeApi, deleteEmployeeApi } from '../../api/index.js';

export const fetchEmployees  = createAsyncThunk('employees/fetchAll', async (params, { rejectWithValue }) => {
  try { const { data } = await getEmployeesApi(params); return data.data; }
  catch (err) { return rejectWithValue(err.response?.data?.message || 'Failed'); }
});
export const fetchEmployee   = createAsyncThunk('employees/fetchOne', async (id, { rejectWithValue }) => {
  try { const { data } = await getEmployeeApi(id); return data.data.employee; }
  catch (err) { return rejectWithValue(err.response?.data?.message || 'Failed'); }
});
export const createEmployee  = createAsyncThunk('employees/create', async (formData, { rejectWithValue }) => {
  try { const { data } = await createEmployeeApi(formData); return data.data.employee; }
  catch (err) { return rejectWithValue(err.response?.data?.message || 'Failed'); }
});
export const updateEmployee  = createAsyncThunk('employees/update', async ({ id, formData }, { rejectWithValue }) => {
  try { const { data } = await updateEmployeeApi(id, formData); return data.data.employee; }
  catch (err) { return rejectWithValue(err.response?.data?.message || 'Failed'); }
});
export const deleteEmployee  = createAsyncThunk('employees/delete', async (id, { rejectWithValue }) => {
  try { await deleteEmployeeApi(id); return id; }
  catch (err) { return rejectWithValue(err.response?.data?.message || 'Failed'); }
});

const employeeSlice = createSlice({
  name: 'employees',
  initialState: { list: [], selected: null, pagination: {}, loading: false, error: null },
  reducers: { clearSelected: (state) => { state.selected = null; } },
  extraReducers: (b) => {
    b
      .addCase(fetchEmployees.pending,   (s) => { s.loading = true; s.error = null; })
      .addCase(fetchEmployees.fulfilled, (s, { payload }) => { s.loading = false; s.list = payload.employees; s.pagination = payload.pagination; })
      .addCase(fetchEmployees.rejected,  (s, { payload }) => { s.loading = false; s.error = payload; })
      .addCase(fetchEmployee.fulfilled,  (s, { payload }) => { s.selected = payload; })
      .addCase(createEmployee.fulfilled, (s, { payload }) => { s.list.unshift(payload); })
      .addCase(updateEmployee.fulfilled, (s, { payload }) => {
        const i = s.list.findIndex(e => e._id === payload._id);
        if (i !== -1) s.list[i] = payload; s.selected = payload;
      })
      .addCase(deleteEmployee.fulfilled, (s, { payload }) => { s.list = s.list.filter(e => e._id !== payload); });
  },
});
export const { clearSelected } = employeeSlice.actions;
export default employeeSlice.reducer;
