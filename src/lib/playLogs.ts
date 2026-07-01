import { auth, db } from './firebase';
import { collection, addDoc, getDocs, query, where, orderBy, onSnapshot } from 'firebase/firestore';

export const savePlayLog = async (contentId: string, creatorXHandle: string | undefined, data: any) => {
  try {
    // recursively remove undefined values
    const cleanData = JSON.parse(JSON.stringify(data, (k, v) => v === undefined ? null : v));
    await addDoc(collection(db, "playLogs"), {
      contentId,
      creatorXHandle: creatorXHandle || "unknown",
      playedAt: new Date().toISOString(),
      userId: auth.currentUser?.uid || "anonymous",
      ...cleanData
    });
  } catch (error) {
    console.error("Failed to save play log", error);
  }
};

export const getPlayStats = async (contentId: string) => {
  try {
    const q = query(collection(db, "playLogs"), where("contentId", "==", contentId));
    const snapshot = await getDocs(q);
    const logs = snapshot.docs.map(doc => doc.data());
    return logs;
  } catch (error) {
    console.error("Failed to get play stats", error);
    return [];
  }
};

export const onSnapshotPlayStats = (contentId: string, callback: (logs: any[]) => void) => {
  const q = query(collection(db, "playLogs"), where("contentId", "==", contentId));
  return onSnapshot(q, (snapshot) => {
    callback(snapshot.docs.map(doc => doc.data()));
  }, (error) => {
    console.error("Failed to listen to play stats", error);
    callback([]);
  });
};
