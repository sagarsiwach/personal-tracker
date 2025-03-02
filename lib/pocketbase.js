import PocketBase from "pocketbase";

// For consistent logging
const log = (message, data = null) => {
  const logMessage = `[PocketBase] ${message}`;
  if (data) {
    console.log(logMessage, data);
  } else {
    console.log(logMessage);
  }
};

// Initialize PocketBase with error handling
let pb;
try {
  pb = new PocketBase("http://127.0.0.1:8090");
  log("PocketBase initialized successfully");
} catch (error) {
  log("Failed to initialize PocketBase", error);
  throw new Error(`PocketBase initialization failed: ${error.message}`);
}

const adminAuth = async () => {
  try {
    log("Checking authentication status");

    // Check if already authenticated
    if (pb.authStore.isValid) {
      log("Already authenticated");
      return true;
    }

    log("Not authenticated, attempting login");
    await pb.admins.authWithPassword(
      "sagar@classicgroup.asia",
      "vbg7xwa7hcz0YXM@jzf",
    );

    log("Authentication successful");
    return true;
  } catch (error) {
    log("Authentication failed", error);
    const errorDetails = error.data
      ? JSON.stringify(error.data)
      : error.message;
    throw new Error(`Authentication failed: ${errorDetails}`);
  }
};

// Helper function to format dates for IST (UTC+5:30)
const getDateRange = () => {
  try {
    log("Calculating date range for IST");

    // Current time
    const now = new Date();
    log("Current UTC time", now.toISOString());

    // Convert to IST (UTC+5:30)
    const istOffset = 5.5 * 60 * 60 * 1000;
    const nowIST = new Date(now.getTime() + istOffset);
    log("Current IST time", nowIST.toISOString());

    // Start of today in IST
    const todayStart = new Date(nowIST);
    todayStart.setHours(0, 0, 0, 0);
    log("Today start (IST)", todayStart.toISOString());

    // Convert back to UTC for database query
    const todayStartUTC = new Date(todayStart.getTime() - istOffset);
    log("Today start (UTC)", todayStartUTC.toISOString());

    // Tomorrow start in IST
    const tomorrowStart = new Date(todayStart);
    tomorrowStart.setDate(todayStart.getDate() + 1);
    log("Tomorrow start (IST)", tomorrowStart.toISOString());

    // Convert to UTC for database query
    const tomorrowStartUTC = new Date(tomorrowStart.getTime() - istOffset);
    log("Tomorrow start (UTC)", tomorrowStartUTC.toISOString());

    return {
      start: todayStartUTC.toISOString(),
      end: tomorrowStartUTC.toISOString(),
    };
  } catch (error) {
    log("Error calculating date range", error);
    throw error;
  }
};

// export const getTodayCounts = async () => {
//   try {
//     log("Starting getTodayCounts");
//     await adminAuth();

//     const dateRange = getDateRange();
//     log("Date range for queries", dateRange);

//     // Query by 'created' field - this is the only field we use for dates now
//     log("Querying by 'created' field");
//     const createdQuery = `created >= "${dateRange.start}" && created < "${dateRange.end}"`;
//     log("Query filter", createdQuery);

//     let records;
//     try {
//       records = await pb.collection("mantras").getList(1, 500, {
//         filter: createdQuery,
//       });
//       log(`Found ${records.totalItems} records by 'created' field`);
//     } catch (error) {
//       log("Error querying by 'created'", error);
//       records = { items: [] };
//     }

//     log("Retrieved records", records.items);

//     // Aggregate counts by mantra name - each record represents one count
//     const mantraCounts = {};

//     for (const record of records.items) {
//       const name = record.name;
//       if (!mantraCounts[name]) {
//         mantraCounts[name] = 0;
//       }
//       mantraCounts[name] += 1; // Each record counts as 1
//     }

//     log("Aggregated counts", mantraCounts);

//     // Convert to array format for API response
//     const result = Object.entries(mantraCounts).map(([name, count]) => ({
//       name,
//       count,
//     }));

//     log("Returning result", result);
//     return result;
//   } catch (error) {
//     log("Error in getTodayCounts", error);
//     throw error;
//   }
// };
//

export const getTodayCounts = async () => {
  try {
    log("Starting getTodayCounts with simplified approach");
    await adminAuth();

    // Get current date in UTC
    const now = new Date();
    const todayStr = now.toISOString().split("T")[0]; // Just get YYYY-MM-DD part

    // Create a simpler filter using the date string prefix
    // This will match records created on the same day regardless of timezone complexities
    const simpleFilter = `created ~ "${todayStr}"`;
    log("Using simplified date filter:", simpleFilter);

    // Query for today's records
    const records = await pb.collection("mantras").getList(1, 500, {
      filter: simpleFilter,
    });

    log(`Found ${records.totalItems} records for today`, records.items);

    // Aggregate counts by mantra name
    const mantraCounts = {};
    for (const record of records.items) {
      const name = record.name;
      if (!mantraCounts[name]) {
        mantraCounts[name] = 0;
      }
      mantraCounts[name] += 1;
    }

    log("Aggregated counts", mantraCounts);

    // Convert to array format for API response
    const result = Object.entries(mantraCounts).map(([name, count]) => ({
      name,
      count,
    }));

    log("Returning result", result);
    return result;
  } catch (error) {
    log("Error in getTodayCounts", error);
    throw error;
  }
};

export const createMantraEntry = async (mantraName) => {
  try {
    log(`Creating entry for mantra: ${mantraName}`);
    await adminAuth();

    // Create new record with just the name
    // The 'created' timestamp will be automatically set by PocketBase
    const data = {
      name: mantraName,
    };

    log("Creating record with data", data);

    const result = await pb.collection("mantras").create(data);
    log("Record created successfully", result);

    return result;
  } catch (error) {
    log("Error creating mantra entry", error);
    throw error;
  }
};
