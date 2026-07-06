import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const firebaseConfig = JSON.parse(fs.readFileSync('./firebase-applet-config.json', 'utf8'));
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
    console.log("Fetching from Firebase using SDK...");
    const snapshot = await getDocs(collection(db, "contents"));
    
    if (snapshot.empty) {
      console.log("No documents found in Firebase.");
      return;
    }
    
    const items = snapshot.docs.map(doc => doc.data());
    console.log(`Found ${items.length} items. Migrating to Supabase...`);
    
    for (const item of items) {
      const { error } = await supabase.from('shitsumon_contents').upsert(item, { onConflict: 'id' });
      if (error) {
        console.error(`Error migrating item ${item.id}:`, error);
      } else {
        console.log(`Successfully migrated ${item.id} - ${item.title}`);
      }
    }
    
    console.log("Migration complete!");
    
  } catch(e) {
    console.error("Migration failed:", e);
  }
}

run();
