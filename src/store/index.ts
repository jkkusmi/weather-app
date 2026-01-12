import { configureStore } from "@reduxjs/toolkit";
import { loadLocalPreferences, saveLocalPreferences } from "./localPreferences";
import localPreferencesReducer from "./localPreferences"

const preloadedLocalPreferences = loadLocalPreferences();

export const store = configureStore({
  reducer: {
    localPreferences: localPreferencesReducer,
  },
  preloadedState: preloadedLocalPreferences
    ? { localPreferences: preloadedLocalPreferences }
    : undefined,
});
    
store.subscribe(() => {
  saveLocalPreferences(store.getState().localPreferences);
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
