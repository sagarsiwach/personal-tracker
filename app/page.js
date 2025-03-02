"use client";
import { useState, useEffect } from "react";
import { format } from "date-fns";

export default function Home() {
  const [counts, setCounts] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const mantras = ["Mantra1", "Mantra2", "Mantra3"];

  const fetchCounts = async () => {
    try {
      const response = await fetch("/api/mantras");
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();

      // Convert array of objects to counts object
      const countsObject = data.reduce((acc, item) => {
        acc[item.name] = item.count;
        return acc;
      }, {});

      // Initialize counts for mantras that don't have records yet
      mantras.forEach((mantra) => {
        if (!(mantra in countsObject)) {
          countsObject[mantra] = 0;
        }
      });

      setCounts(countsObject);
      setError(null);
    } catch (err) {
      setError("Failed to fetch counts");
      console.error("Error fetching counts:", err);
    } finally {
      setLoading(false);
    }
  };

  const incrementCount = async (mantraName) => {
    if (isUpdating) return;

    try {
      setIsUpdating(true);
      setError(null);

      const response = await fetch("/api/mantras", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ mantraName }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log("Increment result:", result);

      // Update local state optimistically
      setCounts((prev) => ({
        ...prev,
        [mantraName]: (prev[mantraName] || 0) + 1,
      }));

      // Fetch the latest counts to ensure consistency
      await fetchCounts();
    } catch (err) {
      setError("Failed to increment count");
      console.error("Error incrementing count:", err);
      // Revert optimistic update on error
      await fetchCounts();
    } finally {
      setIsUpdating(false);
    }
  };

  useEffect(() => {
    fetchCounts();
    const interval = setInterval(fetchCounts, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <main className="min-h-screen p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Mantra Tracker</h1>
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">
            Today's Counts ({format(new Date(), "PP")})
          </h2>

          {error && (
            <div className="bg-red-100 text-red-700 p-3 rounded mb-4">
              {error}
            </div>
          )}

          {loading ? (
            <div className="text-gray-500">Loading...</div>
          ) : (
            <div className="space-y-4">
              {mantras.map((mantra) => (
                <div
                  key={mantra}
                  className="flex items-center justify-between border-b pb-4"
                >
                  <div>
                    <h3 className="font-medium">{mantra}</h3>
                    <p className="text-gray-600">
                      Count: {counts[mantra] || 0}
                    </p>
                  </div>
                  <button
                    onClick={() => incrementCount(mantra)}
                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors disabled:bg-blue-300"
                    disabled={isUpdating}
                  >
                    {isUpdating ? "Updating..." : "Increment"}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
