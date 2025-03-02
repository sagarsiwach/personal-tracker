// app/api-test/page.js
"use client";
import { useState, useEffect } from "react";

export default function APITest() {
  const [getResult, setGetResult] = useState(null);
  const [getResponse, setGetResponse] = useState(null);
  const [postResult, setPostResult] = useState(null);
  const [error, setError] = useState(null);

  const testGet = async () => {
    try {
      console.log("Testing GET request to /api/mantras");
      const res = await fetch("/api/mantras");
      console.log("GET Status:", res.status);
      console.log("GET Headers:", Object.fromEntries([...res.headers]));

      setGetResponse({
        status: res.status,
        statusText: res.statusText,
        headers: Object.fromEntries([...res.headers]),
      });

      const text = await res.text(); // Get raw text first
      console.log("GET Raw response:", text);

      // Only try to parse JSON if there's actual content
      if (text.trim()) {
        try {
          const data = JSON.parse(text);
          setGetResult(data);
        } catch (parseError) {
          setError("JSON Parse Error: " + parseError.message);
        }
      } else {
        setError("Empty response from server");
      }
    } catch (err) {
      setError("GET Error: " + err.message);
      console.error("GET request failed:", err);
    }
  };

  const testPost = async () => {
    try {
      console.log("Testing POST request to /api/mantras");
      const res = await fetch("/api/mantras", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mantraName: "TestMantra" }),
      });
      console.log("POST Status:", res.status);
      console.log("POST Headers:", Object.fromEntries([...res.headers]));

      const text = await res.text(); // Get raw text first
      console.log("POST Raw response:", text);

      // Only try to parse JSON if there's actual content
      if (text.trim()) {
        try {
          const data = JSON.parse(text);
          setPostResult(data);
        } catch (parseError) {
          setError("JSON Parse Error: " + parseError.message);
        }
      } else {
        setError("Empty response from server");
      }
    } catch (err) {
      setError("POST Error: " + err.message);
      console.error("POST request failed:", err);
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl mb-4">API Test Page</h1>

      <div className="mb-4">
        <button
          onClick={testGet}
          className="bg-blue-500 text-white px-4 py-2 rounded mr-4"
        >
          Test GET
        </button>

        <button
          onClick={testPost}
          className="bg-green-500 text-white px-4 py-2 rounded"
        >
          Test POST
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {getResponse && (
        <div className="mb-4">
          <h2 className="text-xl mb-2">GET Response:</h2>
          <pre className="bg-gray-900 p-4 rounded overflow-auto">
            {JSON.stringify(getResponse, null, 2)}
          </pre>
        </div>
      )}

      {getResult && (
        <div className="mb-4">
          <h2 className="text-xl mb-2">GET Result:</h2>
          <pre className="bg-gray-900 p-4 rounded overflow-auto">
            {JSON.stringify(getResult, null, 2)}
          </pre>
        </div>
      )}

      {postResult && (
        <div>
          <h2 className="text-xl mb-2">POST Result:</h2>
          <pre className="bg-gray-900 p-4 rounded overflow-auto">
            {JSON.stringify(postResult, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
