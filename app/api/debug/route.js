// Add this to app/api/debug/route.js
import { NextResponse } from "next/server";
import PocketBase from "pocketbase";

export async function GET() {
  try {
    console.log("Debug API called");

    // Initialize PocketBase
    const pb = new PocketBase("http://127.0.0.1:8090");

    // Authenticate
    await pb.admins.authWithPassword(
      "sagar@classicgroup.asia",
      "vbg7xwa7hcz0YXM@jzf",
    );

    // Get current time
    const now = new Date();
    const istOffset = 5.5 * 60 * 60 * 1000;
    const nowIST = new Date(now.getTime() + istOffset);

    // Calculate date range
    const todayIST = new Date(nowIST);
    todayIST.setHours(0, 0, 0, 0);
    const tomorrowIST = new Date(todayIST);
    tomorrowIST.setDate(todayIST.getDate() + 1);

    // Convert back to UTC for querying
    const todayUTC = new Date(todayIST.getTime() - istOffset);
    const tomorrowUTC = new Date(tomorrowIST.getTime() - istOffset);

    const startDate = todayUTC.toISOString();
    const endDate = tomorrowUTC.toISOString();

    // Try different queries
    const byCreated = await pb.collection("mantras").getList(1, 100, {
      filter: `created >= "${startDate}" && created < "${endDate}"`,
    });

    const byDate = await pb.collection("mantras").getList(1, 100, {
      filter: `date >= "${startDate}" && date < "${endDate}"`,
    });

    // Get all mantras (for debugging)
    const allMantras = await pb.collection("mantras").getList(1, 100, {});

    // Calculate counts by counting records (ignore count field)
    const countsByName = {};
    byCreated.items.forEach((record) => {
      const name = record.name;
      if (!countsByName[name]) {
        countsByName[name] = 0;
      }
      countsByName[name] += 1;
    });

    return NextResponse.json({
      dateRange: {
        nowIST: nowIST.toISOString(),
        startIST: todayIST.toISOString(),
        endIST: tomorrowIST.toISOString(),
        startUTC: startDate,
        endUTC: endDate,
      },
      counts: countsByName,
      recordsByCreated: byCreated.items,
      recordsByDate: byDate.items,
      allRecords: allMantras.items,
      recordCounts: {
        byCreated: byCreated.items.length,
        byDate: byDate.items.length,
        all: allMantras.items.length,
      },
    });
  } catch (error) {
    console.error("Debug API error:", error);
    return NextResponse.json(
      { error: "Debug API error", details: error.message },
      { status: 500 },
    );
  }
}
