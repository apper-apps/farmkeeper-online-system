import { configureStore } from '@reduxjs/toolkit'
import userReducer from './userSlice'

export const store = configureStore({
  reducer: {
    user: userReducer,
  },
})

// Make store globally available for services
if (typeof window !== 'undefined') {
  window.store = store;
}