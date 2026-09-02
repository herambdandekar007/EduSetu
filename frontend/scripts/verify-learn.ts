import "dotenv/config";
import { db } from "../src/firebase/firebase.config.ts";
import { collection, getDocs, query, where } from "firebase/firestore";

const uid = process.argv[2] || "test-user-123";

const collections = [
  "subjects",
  "topics",
  "learningMaterials",
  "quizzes",
  "assignments",
  "learningProgress",
  "recommendations",
];

let total = 0;
for (const c of collections) {
  const q =
    c === "learningProgress"
      ? query(collection(db, c), where("userId", "==", uid))
      : query(collection(db, c), where("userId", "==", uid));
  const snap = await getDocs(q);
  total += snap.size;
  console.log(c.padEnd(20), snap.size, "doc(s)");
}
console.log("--------------------------");
console.log("Total:", total, "documents for", uid);
process.exit(0);
