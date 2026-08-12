import { createSlice } from '@reduxjs/toolkit';

const uiSlice = createSlice({
  name: 'ui',
  initialState: {
    darkMode:    localStorage.getItem('ems_dark') === 'true',
    sidebarOpen: true,
    toast:       null,
  },
  reducers: {
    toggleDarkMode: (state) => {
      state.darkMode = !state.darkMode;
      localStorage.setItem('ems_dark', state.darkMode);
      document.documentElement.classList.toggle('dark', state.darkMode);
    },
    setSidebarOpen:  (state, { payload }) => { state.sidebarOpen = payload ?? !state.sidebarOpen; },
    showToast:       (state, { payload }) => { state.toast = payload; },
    hideToast:       (state) => { state.toast = null; },
  },
});

export const { toggleDarkMode, setSidebarOpen, showToast, hideToast } = uiSlice.actions;
export default uiSlice.reducer;
