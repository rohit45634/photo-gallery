import { useState, useEffect } from "react";

const API_URL = "https://picsum.photos/v2/list?limit=30";

// Custom hook: fetches 30 photos once on mount.
// Returns { photos, loading, error } so the UI never talks to the API directly.
export default function useFetchPhotos() {
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // AbortController cancels the request if the component unmounts mid-fetch
    const controller = new AbortController();

    async function fetchPhotos() {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch(API_URL, { signal: controller.signal });
        if (!res.ok) {
          throw new Error(`Request failed with status ${res.status}`);
        }
        const data = await res.json();
        setPhotos(data);
      } catch (err) {
        // Ignore the abort error, it is not a real failure
        if (err.name !== "AbortError") {
          setError(err.message || "Something went wrong");
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    fetchPhotos();
    return () => controller.abort();
  }, []);

  return { photos, loading, error };
}
