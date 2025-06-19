import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface QCDiscrepancyState {
  selectedItem: any | null;
}

const initialState: QCDiscrepancyState = {
  selectedItem: null,
};

const qcDiscrepancySlice = createSlice({
  name: 'qcDiscrepancy',
  initialState,
  reducers: {
    setSelectedItem(state, action: PayloadAction<any>) {
      state.selectedItem = action.payload;
    },
    clearSelectedItem(state) {
      state.selectedItem = null;
    },
  },
});

export const { setSelectedItem, clearSelectedItem } =
  qcDiscrepancySlice.actions;
export default qcDiscrepancySlice.reducer;
