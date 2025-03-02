// app/api/mantras/route.js
import { createMantraEntry, getTodayCounts } from "@/lib/pocketbase";
import { NextResponse } from "next/server";

// For debugging
const logRequest = (method, url) => {
  console.log(`[${method}] ${url} - ${new Date().toISOString()}`);
};

export async function GET(request) {
  logRequest("GET", request.url);

  try {
    console.log("Processing GET request to /api/mantras");
    const counts = await getTodayCounts();
    console.log("Retrieved counts:", counts);

    // Ensure we're returning a valid response
    return NextResponse.json(counts || []);
  } catch (error) {
    console.error("Error in GET /api/mantras:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 },
    );
  }
}

export async function POST(request) {
  logRequest("POST", request.url);

  try {
    console.log("Processing POST request to /api/mantras");
    // Safely parse JSON
    let body;
    try {
      body = await request.json();
      console.log("Received body:", body);
    } catch (e) {
      console.error("Failed to parse request body:", e);
      return NextResponse.json(
        { error: "Invalid JSON in request body" },
        { status: 400 },
      );
    }

    const { mantraName } = body;

    if (!mantraName) {
      return NextResponse.json(
        { error: "Mantra name is required" },
        { status: 400 },
      );
    }

    console.log(`Creating entry for mantra: ${mantraName}`);
    const result = await createMantraEntry(mantraName);
    console.log("Creation result:", result);

    // Get updated counts
    console.log("Getting updated counts after creation");
    const updatedCounts = await getTodayCounts();
    console.log("Updated counts:", updatedCounts);

    return NextResponse.json({
      success: true,
      data: result,
      currentCounts: updatedCounts || [],
    });
  } catch (error) {
    console.error("Error in POST /api/mantras:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 },
    );
  }
}
