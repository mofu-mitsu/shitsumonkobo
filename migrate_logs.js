import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import { createClient } from '@supabase/supabase-js';

const firebaseConfig = {
  projectId: "gen-lang-client-0858097960",
  appId: "1:656387691128:web:9aeb87363be9734b73538d",
  apiKey: "AIzaSyCKiukLUs8DlGvE8CU_R4iXYxB6Yt-IanU",
  authDomain: "gen-lang-client-0858097960.firebaseapp.com",
  firestoreDatabaseId: "ai-studio-8b45955a-b902-4ba8-8a93-bd5476d4b9d2"
};
const app = initializeApp(firebaseConfig);
const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

const SUPABASE_URL = process.env.VITE_SUPABASE_URL.trim();
let SUPABASE_KEY = process.env.VITE_SUPABASE_ANON_KEY.trim();
if (SUPABASE_KEY.includes('eyJ')) {
  SUPABASE_KEY = SUPABASE_KEY.substring(SUPABASE_KEY.indexOf('eyJ'));
}
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function run() {
  try {
    console.log("Fetching playLogs from Firebase...");
    const snapshot = await getDocs(collection(db, "playLogs"));
    if (snapshot.empty) {
      console.log("No playLogs found in Firebase.");
      return;
    }
    const items = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        content_id: data.contentId,
        creator_x_handle: data.creatorXHandle || "unknown",
        played_at: data.playedAt || new Date().toISOString(),
        user_id: data.userId || "anonymous",
        data: data.data || {}
      };
    });
    console.log(`Found ${items.length} playLogs. Migrating to Supabase...`);
    
    // insert in batches
    for (let i = 0; i < items.length; i += 50) {
      const batch = items.slice(i, i + 50);
      const { error } = await supabase.from('shitsumon_play_logs').upsert(batch, { onConflict: 'id' });
      if (error) {
        console.error(`Error migrating batch:`, error);
      } else {
        console.log(`Successfully migrated batch ${i}`);
      }
    }
    console.log("Migration complete!");
  } catch(e) {
    console.error("Migration failed:", e);
  }
}

run();
