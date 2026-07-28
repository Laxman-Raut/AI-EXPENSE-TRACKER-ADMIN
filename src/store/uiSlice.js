import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  sidebarCollapsed: false,
  theme: 'light',
  activeView: 'dashboard',
  searchQuery: '',
  currency: 'INR',
};

export const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleSidebar: (state) => {
      state.sidebarCollapsed = !state.sidebarCollapsed;
    },
    setSidebarCollapsed: (state, action) => {
      state.sidebarCollapsed = action.payload;
    },
    setTheme: (state, action) => {
      state.theme = action.payload;
      if (typeof window !== 'undefined') {
        const root = window.document.documentElement;
        if (action.payload === 'dark') {
          root.classList.add('dark');
          localStorage.setItem('theme', 'dark');
        } else {
          root.classList.remove('dark');
          localStorage.setItem('theme', 'light');
        }
      }
    },
    setActiveView: (state, action) => {
      state.activeView = action.payload;
    },
    setSearchQuery: (state, action) => {
      state.searchQuery = action.payload;
    },
    setCurrency: (state, action) => {
      state.currency = action.payload;
    },
  },
});

export const { toggleSidebar, setSidebarCollapsed, setTheme, setActiveView, setSearchQuery, setCurrency } = uiSlice.actions;
export default uiSlice.reducer;
