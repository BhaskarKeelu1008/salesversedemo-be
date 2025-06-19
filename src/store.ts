import { configureStore } from '@reduxjs/toolkit';
import qcDiscrepancyReducer from './features/qc-discrepancy/qcDiscrepancySlice';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';

const persistConfig = {
  key: 'qcDiscrepancy',
  storage,
};

const persistedQcDiscrepancyReducer = persistReducer(
  persistConfig,
  qcDiscrepancyReducer
);

const store = configureStore({
  reducer: {
    qcDiscrepancy: persistedQcDiscrepancyReducer,
    // add other reducers here
  },
});

export const persistor = persistStore(store);
export default store;
