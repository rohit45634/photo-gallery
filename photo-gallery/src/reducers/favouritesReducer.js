// Favourites are stored as an array of photo ids.
export const FAVOURITES_KEY = "photo-gallery-favourites";

// Reads saved favourites from localStorage. Used as the lazy initialiser for useReducer.
export function initFavourites() {
  try {
    const saved = localStorage.getItem(FAVOURITES_KEY);
    const parsed = saved ? JSON.parse(saved) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

// Handles one action: TOGGLE_FAVOURITE (add the id if missing, remove it if present).
export function favouritesReducer(state, action) {
  switch (action.type) {
    case "TOGGLE_FAVOURITE":
      return state.includes(action.id)
        ? state.filter((id) => id !== action.id)
        : [...state, action.id];
    default:
      return state;
  }
}
