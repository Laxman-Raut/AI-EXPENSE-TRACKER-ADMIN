import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  profile: {
    name: 'Amarg S.',
    email: 'admin@expenseai.co',
    role: 'Super Administrator',
    avatar: 'AS',
    twoFactor: true,
    emailNotifications: true,
    smsNotifications: false,
    maintenanceMode: false,
    autoBackup: true,
  },
};

export const adminSlice = createSlice({
  name: 'admin',
  initialState,
  reducers: {
    updateProfile: (state, action) => {
      state.profile = { ...state.profile, ...action.payload };
    },
  },
});

export const { updateProfile } = adminSlice.actions;
export default adminSlice.reducer;
