const fs = require("fs");
const path = require("path");
const { MongoClient } = require("mongodb");

// Parse .env.local manually to load variables
const envLocalPath = path.join(process.cwd(), ".env.local");
let uri = "";
let dbName = "pure_ayur_herbs";

if (fs.existsSync(envLocalPath)) {
  const envContent = fs.readFileSync(envLocalPath, "utf8");
  const lines = envContent.split("\n");
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith("#")) {
      const parts = trimmed.split("=");
      const key = parts[0].trim();
      const val = parts.slice(1).join("=").trim();
      if (key === "MONGODB_URI") uri = val;
      if (key === "MONGODB_DB") dbName = val;
    }
  }
}

const dbJsonPath = path.join(process.cwd(), "src/lib/db.json");

async function migrate() {
  if (!uri) {
    console.error("Error: MONGODB_URI is not set in .env.local");
    process.exit(1);
  }

  if (!fs.existsSync(dbJsonPath)) {
    console.error(`Error: local db.json not found at ${dbJsonPath}`);
    process.exit(1);
  }

  console.log("Connecting to MongoDB Atlas...");
  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log("Connected successfully!");

    const db = client.db(dbName);
    const collection = db.collection("store_data");

    console.log(`Reading local data from ${dbJsonPath}...`);
    const rawData = fs.readFileSync(dbJsonPath, "utf-8");
    const jsonData = JSON.parse(rawData);

    // Remove MongoDB _id to avoid modification errors if it exists
    delete jsonData._id;

    console.log("Uploading data to MongoDB (upserting doc with _id: 'main')...");
    const result = await collection.replaceOne(
      { _id: "main" },
      jsonData,
      { upsert: true }
    );

    console.log("\nMigration complete!");
    console.log(`- Matched count: ${result.matchedCount}`);
    console.log(`- Modified count: ${result.modifiedCount}`);
    console.log(`- Upserted count: ${result.upsertedCount}`);
  } catch (error) {
    console.error("Migration failed with error:", error);
  } finally {
    await client.close();
  }
}

migrate();
