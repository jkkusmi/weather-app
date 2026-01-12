import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export type TempUnit = "C" | "F";

export type LocalPreferencesState = {
  MAIN_LOCATION: string;
  SAVED_LOCATIONS: string[];
  TEMP_UNIT: string;
};

const KEY = "localPreferences";

export const loadLocalPreferences = (): LocalPreferencesState | undefined => {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return undefined;
    return JSON.parse(raw) as LocalPreferencesState;
  } catch {
    return undefined;
  }
};

export const saveLocalPreferences = (state: LocalPreferencesState) => {
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {}
};

const initialState: LocalPreferencesState = {
  MAIN_LOCATION: "Wrocław",
  SAVED_LOCATIONS: ["Mumbai", "La Paz", "Dubai", "Hanover", "Bergen", "Jalalabad", "Jackpot", "Tehran", "Hokkaido", "Voronezh"],
  TEMP_UNIT: "C",
};

const localPreferencesSlice = createSlice({
  name: "localPreferences",
  initialState,
  reducers: {
    setMainLocation(state, action: PayloadAction<string>) {
      const next = action.payload;
      const prev = state.MAIN_LOCATION;
      console.log("Attempting to replace "+state.MAIN_LOCATION+" with "+action.payload+"...")

      if (next === prev) return;

      state.MAIN_LOCATION = next;

      state.SAVED_LOCATIONS = [
        prev,
        ...state.SAVED_LOCATIONS.filter(c => c !== next && c !== prev),
      ];

      const heroSection = document.getElementById('hero-section');
      heroSection?.scrollIntoView({ behavior: 'smooth' });
    },

    setSavedLocations(state, action: PayloadAction<string[]>) {
      state.SAVED_LOCATIONS = action.payload;
    },

    addSavedLocation(state, action: PayloadAction<string>) {
      const city = action.payload;
      if (city === state.MAIN_LOCATION) return;
      if (state.SAVED_LOCATIONS.includes(city)) return;
      state.SAVED_LOCATIONS.unshift(city);
    },

    removeSavedLocation(state, action: PayloadAction<string>) {
      state.SAVED_LOCATIONS = state.SAVED_LOCATIONS.filter(
        c => c !== action.payload
      );
    },

    setTempUnit(state, action: PayloadAction<TempUnit>) {
      state.TEMP_UNIT = action.payload;
    },

    toggleTempUnit(state) {
      state.TEMP_UNIT = state.TEMP_UNIT === "C" ? "F" : "C";
    },
  },
});

export const {
  setMainLocation,
  setSavedLocations,
  addSavedLocation,
  removeSavedLocation,
  toggleTempUnit,
} = localPreferencesSlice.actions;

export default localPreferencesSlice.reducer;
