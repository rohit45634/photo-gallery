import { useReducer, useEffect, useState, useCallback, useMemo } from "react";
import useFetchPhotos from "../hooks/useFetchPhotos.js";
import {
  favouritesReducer,
  initFavourites,
  FAVOURITES_KEY,
} from "../reducers/favouritesReducer.js";
import PhotoCard from "./PhotoCard.jsx";

export default function Gallery() {
  // Data comes from the custom hook, Gallery never calls fetch itself
  const { photos, loading, error } = useFetchPhotos();

  // Favourites: useReducer (not useState), initialised from localStorage
  const [favourites, dispatch] = useReducer(
    favouritesReducer,
    undefined,
    initFavourites
  );

  // Persist favourites whenever they change
  useEffect(() => {
    try {
      localStorage.setItem(FAVOURITES_KEY, JSON.stringify(favourites));
    } catch {
      // storage full or blocked: ignore, app still works for this session
    }
  }, [favourites]);

  // The search text is plain input state, so useState is correct for it
  const [query, setQuery] = useState("");

  // useCallback: keeps the same function identity between renders so the
  // input's handler is not recreated on every render
  const handleSearch = useCallback((e) => {
    setQuery(e.target.value);
  }, []);

  // useCallback also keeps onToggle stable, so memoised PhotoCards
  // do not all re-render when only one favourite changes
  const handleToggle = useCallback((id) => {
    dispatch({ type: "TOGGLE_FAVOURITE", id });
  }, []);

  // useMemo: the filtered list is only recomputed when photos or query change,
  // not on unrelated re-renders (like toggling a favourite)
  const filteredPhotos = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return photos;
    return photos.filter((p) => p.author.toLowerCase().includes(term));
  }, [photos, query]);

  return (
    <main className="mx-auto max-w-7xl px-4 py-8">
      <h1 className="mb-6 text-3xl font-bold text-gray-900">Photo Gallery</h1>

      <input
        type="text"
        value={query}
        onChange={handleSearch}
        placeholder="Search by author name..."
        aria-label="Search photos by author"
        className="mb-8 w-full rounded-lg border border-gray-300 bg-white px-4 py-2 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 sm:max-w-md"
      />

      {loading && (
        <div className="flex justify-center py-20" role="status">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-gray-300 border-t-blue-500" />
          <span className="sr-only">Loading photos...</span>
        </div>
      )}

      {error && !loading && (
        <div
          role="alert"
          className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700"
        >
          Failed to load photos: {error}
        </div>
      )}

      {!loading && !error && filteredPhotos.length === 0 && (
        <p className="py-10 text-center text-gray-500">
          No photos match your search.
        </p>
      )}

      {!loading && !error && filteredPhotos.length > 0 && (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          {filteredPhotos.map((photo) => (
            <PhotoCard
              key={photo.id}
              photo={photo}
              isFavourite={favourites.includes(photo.id)}
              onToggle={handleToggle}
            />
          ))}
        </div>
      )}
    </main>
  );
}
