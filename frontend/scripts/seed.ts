import "dotenv/config";
//import { seedPwdJobs } from "../src/firebase/collections/jobs.ts";
//import { seedSchemes } from "../src/firebase/collections/schemes.ts";
//import { seedCourses } from "../src/firebase/collections/courses.ts";
import { createProfile } from "../src/firebase/collections/profiles.ts";
import { seedLearnData } from "../src/firebase/collections/learn.ts";

// Seeding target: pass a userId as CLI arg or defaults to the test user.
const SEED_USER_ID = process.argv[2] || "test-user-123";

const seedAll = async () => {
  console.log("🚀 Starting Firestore seeding...");

  //console.log("\n📌 Seeding Jobs...");
  //await seedPwdJobs();

  //console.log("\n📌 Seeding Schemes...");
  //await seedSchemes();

  //console.log("\n📌 Seeding Courses...");
  //await seedCourses();
console.log(`\n📌 Creating Test Profile (${SEED_USER_ID})...`);

  await createProfile(
    SEED_USER_ID,
    "testuser@gmail.com",
    "Test User"
  );

  await seedLearnData(SEED_USER_ID);

  console.log("\n✅ Profile created successfully!");
};
seedAll().catch((err) => {
  console.error("❌ Seeding failed:", err);
});