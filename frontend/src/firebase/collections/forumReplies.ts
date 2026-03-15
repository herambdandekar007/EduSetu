import { db } from "../firebase.config";
import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
  serverTimestamp,
} from "firebase/firestore";
import { incrementReplyCount } from "./forumPosts";

// Firestore Collection: "forum_replies"
// Document ID: auto-generated

export interface ForumReplyDocument {
  postId: string;                        // Parent post ID
  userId: string;                        // Firebase Auth UID
  content: string;                       // required
  likesCount: number;                    // default: 0
  createdAt: any;                        // serverTimestamp()
  updatedAt: any;                        // serverTimestamp()
}

// Create reply + increment post reply count
export const createReply = async (data: Omit<ForumReplyDocument, "createdAt" | "updatedAt">) => {
  const repliesRef = collection(db, "forum_replies");
  await addDoc(repliesRef, {
    ...data,
    likesCount: 0,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  await incrementReplyCount(data.postId); // mirrors the SQL trigger
};

// Get replies for a post
export const getRepliesByPost = async (postId: string) => {
  const repliesRef = collection(db, "forum_replies");
  const q = query(repliesRef, where("postId", "==", postId));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as ForumReplyDocument & { id: string }));
};

// Update reply
export const updateReply = async (replyId: string, data: Partial<ForumReplyDocument>) => {
  const replyRef = doc(db, "forum_replies", replyId);
  await updateDoc(replyRef, { ...data, updatedAt: serverTimestamp() });
};

// Delete reply
export const deleteReply = async (replyId: string) => {
  const replyRef = doc(db, "forum_replies", replyId);
  await deleteDoc(replyRef);
};