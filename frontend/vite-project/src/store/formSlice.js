import { createSlice } from '@reduxjs/toolkit';

const formSlice = createSlice({
  name: 'form',
  initialState: {
    hcp_name: '',
    interaction_type: 'Meeting',
    date: '',
    time: '',
    attendees: '',
    topics_discussed: '',
    materials_shared: '',
    samples_distributed: '',
    sentiment: '', 
    outcomes: '',
    follow_up_actions: ''
  },
  reducers: {
    updateFormData: (state, action) => {
      return { ...state, ...action.payload };
    }
  }
});

export const { updateFormData } = formSlice.actions;
export default formSlice.reducer;