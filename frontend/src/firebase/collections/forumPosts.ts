import { db } from "../firebase.config";
import {
  collection,
  addDoc,
  getDocs,
  getDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
  query,
  orderBy,
  increment,
  limit,
  startAfter,
  QueryDocumentSnapshot,
  DocumentData,
} from "firebase/firestore";

// Firestore Collection: "forum_posts"
// Document ID: auto-generated

export interface ForumPostDocument {
  userId: string; // Firebase Auth UID
  title: string; // required
  content: string; // required
  category: string; // default: 'general'
  tags: string[]; // default: []
  likesCount: number; // default: 0
  repliesCount: number; // default: 0
  isPinned: boolean; // default: false
  createdAt: any; // serverTimestamp()
  updatedAt: any; // serverTimestamp()
}

// Create post
export const createPost = async (
  data: Omit<
    ForumPostDocument,
    "likesCount" | "repliesCount" | "isPinned" | "createdAt" | "updatedAt"
  >
) => {
  const postsRef = collection(db, "forum_posts");
  return addDoc(postsRef, {
    ...data,
    category: data.category ?? "general",
    tags: data.tags ?? [],
    likesCount: 0,
    repliesCount: 0,
    isPinned: false,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  } satisfies ForumPostDocument);
};

// Get all posts (simple)
export const getAllPosts = async () => {
  const postsRef = collection(db, "forum_posts");
  const q = query(postsRef, orderBy("createdAt", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as ForumPostDocument & { id: string }));
};

// Optional: pagination helper (recommended when you have many posts)
export const getPostsPage = async (pageSize = 20, cursor?: QueryDocumentSnapshot<DocumentData>) => {
  const postsRef = collection(db, "forum_posts");
  const base = query(postsRef, orderBy("createdAt", "desc"), limit(pageSize));
  const q = cursor ? query(postsRef, orderBy("createdAt", "desc"), startAfter(cursor), limit(pageSize)) : base;

  const snap = await getDocs(q);
  return {
    items: snap.docs.map((d) => ({ id: d.id, ...d.data() } as ForumPostDocument & { id: string })),
    nextCursor: snap.docs[snap.docs.length - 1],
  };
};

// Update post
// NOTE: Do not allow userId/createdAt to be changed from client
export const updatePost = async (
  postId: string,
  data: Partial<Omit<ForumPostDocument, "userId" | "createdAt">>
) => {
  const postRef = doc(db, "forum_posts", postId);
  await updateDoc(postRef, { ...data, updatedAt: serverTimestamp() });
};

// Delete post
export const deletePost = async (postId: string) => {
  const postRef = doc(db, "forum_posts", postId);
  await deleteDoc(postRef);
};

// Increment reply count (best practice: use atomic increment)
export const incrementReplyCount = async (postId: string, by = 1) => {
  const postRef = doc(db, "forum_posts", postId);
  await updateDoc(postRef, {
    repliesCount: increment(by),
    updatedAt: serverTimestamp(),
  });
};

// Optional: increment likes
export const incrementLikeCount = async (postId: string, by = 1) => {
  const postRef = doc(db, "forum_posts", postId);
  await updateDoc(postRef, {
    likesCount: increment(by),
    updatedAt: serverTimestamp(),
  });
};

// Optional: pin/unpin (admin)
export const setPinned = async (postId: string, isPinned: boolean) => {
  const postRef = doc(db, "forum_posts", postId);
  await updateDoc(postRef, { isPinned, updatedAt: serverTimestamp() });
};

// Optional: get single post
export const getPostById = async (postId: string) => {
  const postRef = doc(db, "forum_posts", postId);
  const snap = await getDoc(postRef);
  return snap.exists() ? ({ id: snap.id, ...snap.data() } as ForumPostDocument & { id: string }) : null;
};