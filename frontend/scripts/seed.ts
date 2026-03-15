import "dotenv/config";
//import { seedPwdJobs } from "../src/firebase/collections/jobs.ts";
//import { seedSchemes } from "../src/firebase/collections/schemes.ts";
//import { seedCourses } from "../src/firebase/collections/courses.ts";
import { createProfile } from "../src/firebase/collections/profiles.ts";
const seedAll = async () => {
  console.log("🚀 Starting Firestore seeding...");

  //console.log("\n📌 Seeding Jobs...");
  //await seedPwdJobs();

  //console.log("\n📌 Seeding Schemes...");
  //await seedSchemes();

  //console.log("\n📌 Seeding Courses...");
  //await seedCourses();
console.log("\n📌 Creating Test Profile...");

  await createProfile(
    "test-user-123",
    "testuser@gmail.com",
    "Test User"
  );

  console.log("\n✅ Profile created successfully!");
};
seedAll().catch((err) => {
  console.error("❌ Seeding failed:", err);
});