import { createMantraEntry, getTodayCounts } from "@/lib/pocketbase";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const counts = await getTodayCounts();
    console.log("API - Today's counts:", counts);
    return NextResponse.json(counts);
  } catch (error) {
    console.error("Error in GET /api/mantras:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 },
    );
  }
}

export async function POST(request) {
  try {
    const { mantraName } = await request.json();

    if (!mantraName) {
      return NextResponse.json(
        { error: "Mantra name is required" },
        { status: 400 },
      );
    }

    const result = await createMantraEntry(mantraName);

    // Get updated counts after creating/updating the entry
    const updatedCounts = await getTodayCounts();

    return NextResponse.json({
      success: true,
      data: result,
      currentCounts: updatedCounts,
    });
  } catch (error) {
    console.error("Error in POST /api/mantras:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 },
    );
  }
}
