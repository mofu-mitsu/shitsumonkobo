import { db } from './firebase';
import { collection, doc, setDoc, getDoc, getDocs, deleteDoc, query, where } from 'firebase/firestore';
import { ShitsumonKobo_Content } from '../types';

export const getPublicContents = async (): Promise<ShitsumonKobo_Content[]> => {
  try {
    const q = query(collection(db, "contents"), where("isPublic", "==", true));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => doc.data() as ShitsumonKobo_Content);
  } catch (error) {
    console.error("Failed to get public contents", error);
    return [];
  }
};

export const getMyContents = async (userId: string | null): Promise<ShitsumonKobo_Content[]> => {
  if (!userId) return [];
  try {
    const q = query(collection(db, "contents"), where("creatorId", "==", userId));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => doc.data() as ShitsumonKobo_Content);
  } catch (error) {
    console.error("Failed to get my contents", error);
    return [];
  }
};

export const getContentById = async (id: string): Promise<ShitsumonKobo_Content | null> => {
  try {
    const docRef = doc(db, "contents", id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data() as ShitsumonKobo_Content;
    }
    return null;
  } catch (error) {
    console.error("Failed to get content", error);
    return null;
  }
};

export const saveContent = async (content: ShitsumonKobo_Content): Promise<void> => {
  try {
    if (!content.id) {
      content.id = "ShitsumonKobo_" + Math.random().toString(36).substr(2, 9);
    }
    // undefinedを削除
    const cleanData = JSON.parse(JSON.stringify(content, (k, v) => v === undefined ? null : v));
    await setDoc(doc(db, "contents", content.id), cleanData);
  } catch (error) {
    console.error("Failed to save content", error);
    throw error;
  }
};

export const deleteContent = async (id: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, "contents", id));
  } catch (error) {
    console.error("Failed to delete content", error);
    throw error;
  }
};

export const syncUserPlayHistory = async (userId: string, history: ShitsumonKobo_Content[]): Promise<void> => {
  try {
    // Only save essential info to prevent document size limits
    const minimalHistory = history.map(item => ({
      id: item.id,
      title: item.title,
      type: item.type,
      creatorName: item.creatorName || "",
      description: item.description ? item.description.substring(0, 100) : "",
      themeColorMode: item.themeColorMode || "auto",
      customColor: item.customColor || "",
    }));
    await setDoc(doc(db, "user_profiles", userId), { playHistory: minimalHistory }, { merge: true });
  } catch (error) {
    console.error("Failed to sync play history", error);
  }
};

export const getUserPlayHistory = async (userId: string): Promise<ShitsumonKobo_Content[]> => {
  try {
    const docSnap = await getDoc(doc(db, "user_profiles", userId));
    if (docSnap.exists() && docSnap.data().playHistory) {
      return docSnap.data().playHistory as ShitsumonKobo_Content[];
    }
  } catch (error) {
    console.error("Failed to get play history", error);
  }
  return [];
};
