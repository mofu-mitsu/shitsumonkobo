import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import fs from 'fs';

const firebaseConfig = {
  projectId: "gen-lang-client-0858097960",
  appId: "1:656387691128:web:9aeb87363be9734b73538d",
  apiKey: "AIzaSyCKiukLUs8DlGvE8CU_R4iXYxB6Yt-IanU",
  authDomain: "gen-lang-client-0858097960.firebaseapp.com",
  firestoreDatabaseId: "ai-studio-8b45955a-b902-4ba8-8a93-bd5476d4b9d2"
};
const app = initializeApp(firebaseConfig);
const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

async function run() {
  const pDocs = await getDocs(collection(db, "playLogs"));
  console.log("Firebase playLogs:", pDocs.size);
  const uDocs = await getDocs(collection(db, "userPlayHistory"));
  console.log("Firebase userPlayHistory:", uDocs.size);
}
run();
