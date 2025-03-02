import PocketBase from "pocketbase";

const pb = new PocketBase("http://127.0.0.1:8090");

const adminAuth = async () => {
  await pb.admins.authWithPassword(
    "sagar@classicgroup.asia",
    "vbg7xwa7hcz0YXM@jzf",
  );
};

export const getTodayCounts = async () => {
  try {
    await adminAuth();

    // Get today's date range
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Format dates for PocketBase query
    const startDate = today.toISOString();
    const endDate = tomorrow.toISOString();

    console.log("Querying records between:", startDate, "and", endDate);

    // Get records for today using date range
    const records = await pb.collection("mantras").getList(1, 1000, {
      filter: `date >= "${startDate}" && date < "${endDate}"`,
      sort: "-created",
    });

    console.log("Retrieved records:", records.items);

    // Aggregate counts by mantra name
    const aggregatedCounts = records.items.reduce((acc, record) => {
      if (!acc[record.name]) {
        acc[record.name] = 0;
      }
      acc[record.name] += record.count;
      return acc;
    }, {});

    // Convert to the expected format
    const result = Object.entries(aggregatedCounts).map(([name, count]) => ({
      name,
      count,
    }));

    console.log("Aggregated counts:", result);
    return result;
  } catch (error) {
    console.error("Error in getTodayCounts:", error);
    throw error;
  }
};

export const createMantraEntry = async (mantraName) => {
  try {
    await adminAuth();

    // Get today's start date
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayISO = today.toISOString();

    console.log("Creating/updating entry for date:", todayISO);

    // Get today's records for this mantra using date range
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const existingRecords = await pb.collection("mantras").getList(1, 1, {
      filter: `name = "${mantraName}" && date >= "${todayISO}" && date < "${tomorrow.toISOString()}"`,
      sort: "-created",
    });

    console.log("Existing records found:", existingRecords.items);

    if (existingRecords.items.length > 0) {
      // Update the most recent record
      const latestRecord = existingRecords.items[0];
      console.log("Updating existing record:", latestRecord);

      const updatedRecord = await pb
        .collection("mantras")
        .update(latestRecord.id, {
          count: latestRecord.count + 1,
        });
      console.log("Record updated:", updatedRecord);
      return updatedRecord;
    } else {
      // Create new record
      console.log("Creating new record for:", mantraName);
      const newRecord = await pb.collection("mantras").create({
        name: mantraName,
        count: 1,
        date: todayISO,
      });
      console.log("New record created:", newRecord);
      return newRecord;
    }
  } catch (error) {
    console.error("Error in createMantraEntry:", error);
    throw error;
  }
};
