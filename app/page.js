"use client";
import { useState, useEffect } from "react";
import { format } from "date-fns";

export default function Home() {
  const [counts, setCounts] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [newMantra, setNewMantra] = useState("");
  const [mantras, setMantras] = useState(["Mantra1", "Mantra2", "Mantra3"]);

  const fetchCounts = async () => {
    try {
      setLoading(true);
      console.log("Fetching counts from API...");

      const response = await fetch("/api/mantras");

      if (!response.ok) {
        const errorText = await response.text();
        console.error("API error response:", errorText);
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log("API response data:", data);

      // Convert array of objects to counts object
      const countsObject = {};

      // First set all mantras to 0 count
      mantras.forEach((mantra) => {
        countsObject[mantra] = 0;
      });

      // Then update with actual counts from API
      if (Array.isArray(data)) {
        data.forEach((item) => {
          // If this is a mantra we're tracking, update its count
          if (mantras.includes(item.name)) {
            countsObject[item.name] = item.count;
          }
          // If it's a new mantra we don't have in our list, add it
          else if (!mantras.includes(item.name)) {
            setMantras((prev) => [...prev, item.name]);
            countsObject[item.name] = item.count;
          }
        });
      }

      console.log("Final counts object:", countsObject);
      setCounts(countsObject);
      setError(null);
    } catch (err) {
      console.error("Error fetching counts:", err);
      setError("Failed to fetch counts: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const incrementCount = async (mantraName) => {
    if (isUpdating) return;

    try {
      setIsUpdating(true);
      setError(null);
      console.log(`Incrementing count for ${mantraName}...`);

      const response = await fetch("/api/mantras", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ mantraName }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("API error response:", errorText);
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log("Increment result:", result);

      // Optimistically update the local state
      setCounts((prev) => ({
        ...prev,
        [mantraName]: (prev[mantraName] || 0) + 1,
      }));

      // Then fetch the latest state to ensure everything is up-to-date
      await fetchCounts();
    } catch (err) {
      console.error("Error incrementing count:", err);
      setError("Failed to increment count: " + err.message);
      // Revert optimistic update on error
      await fetchCounts();
    } finally {
      setIsUpdating(false);
    }
  };

  const addNewMantra = () => {
    if (!newMantra.trim()) return;

    if (!mantras.includes(newMantra)) {
      setMantras((prev) => [...prev, newMantra]);
      setCounts((prev) => ({
        ...prev,
        [newMantra]: 0,
      }));
      setNewMantra("");
    }
  };

  useEffect(() => {
    fetchCounts();
    const interval = setInterval(fetchCounts, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  return (
    <main className="min-h-screen bg-[#161616] text-white">
      {/* IBM Carbon Header */}
      <header className="bg-[#000000] text-white py-4">
        <div className="max-w-6xl mx-auto px-4">
          <h1 className="text-2xl font-medium">Mantra Tracker</h1>
        </div>
      </header>

      <div className="max-w-6xl mx-auto p-8">
        <div className="mb-8 flex justify-between items-center">
          <h2 className="text-2xl font-medium">
            Today's Counts ({format(new Date(), "MMMM d, yyyy")})
          </h2>
          <button
            onClick={fetchCounts}
            className="bg-[#393939] text-white px-4 py-2 hover:bg-[#4d4d4d] transition-colors"
            disabled={loading}
          >
            {loading ? "Refreshing..." : "Refresh"}
          </button>
        </div>

        {/* Error message */}
        {error && (
          <div className="bg-[#da1e28] bg-opacity-10 border-l-4 border-[#da1e28] text-[#fa4d56] p-4 mb-6">
            <p className="font-medium">Error</p>
            <p>{error}</p>
          </div>
        )}

        {/* Add new mantra form */}
        <div className="bg-[#262626] border border-[#393939] p-5 mb-6">
          <h3 className="text-lg font-medium mb-4">Add New Mantra</h3>
          <div className="flex gap-3">
            <div className="flex-grow">
              <input
                type="text"
                value={newMantra}
                onChange={(e) => setNewMantra(e.target.value)}
                placeholder="Enter a new mantra"
                className="border border-[#6f6f6f] bg-[#393939] px-4 py-2 w-full focus:outline-none focus:border-[#0f62fe]"
              />
            </div>
            <button
              onClick={addNewMantra}
              className="bg-[#0f62fe] text-white px-4 py-2 hover:bg-[#0353e9] transition-colors"
              disabled={!newMantra.trim()}
            >
              Add
            </button>
          </div>
        </div>

        {/* Mantra list */}
        <div className="bg-[#262626] border border-[#393939] p-5">
          {loading && mantras.length === 0 ? (
            <div className="py-8 text-center text-[#c6c6c6]">
              <div className="inline-block w-6 h-6 border-2 border-[#6f6f6f] border-t-[#0f62fe] rounded-full animate-spin mr-2"></div>
              Loading mantras...
            </div>
          ) : (
            mantras.map((mantra) => (
              <div
                key={mantra}
                className="py-5 border-b border-[#525252] last:border-b-0"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-xl">{mantra}</h3>
                    <div className="mt-2 flex items-center">
                      <span className="text-[#c6c6c6] mr-2">Count:</span>
                      <span className="bg-[#393939] px-3 py-1 font-medium">
                        {counts[mantra] || 0}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => incrementCount(mantra)}
                    className="bg-[#0f62fe] text-white px-4 py-2 hover:bg-[#0353e9] transition-colors"
                    disabled={isUpdating}
                  >
                    {isUpdating ? (
                      <>
                        <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></span>
                        Updating...
                      </>
                    ) : (
                      "Increment"
                    )}
                  </button>
                </div>
              </div>
            ))
          )}

          {!loading && mantras.length === 0 && (
            <div className="py-8 text-center text-[#c6c6c6]">
              No mantras added yet. Add your first mantra above.
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
