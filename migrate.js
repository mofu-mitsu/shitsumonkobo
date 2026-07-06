import { createClient } from '@supabase/supabase-js';
import fetch from 'node-fetch';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL.trim();
let SUPABASE_KEY = process.env.VITE_SUPABASE_ANON_KEY.trim();
if (SUPABASE_KEY.includes('eyJ')) {
  SUPABASE_KEY = 'eyJ' + SUPABASE_KEY.split('eyJ')[1];
}
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

function parseFirestoreValue(value) {
  if (!value) return null;
  if (value.stringValue !== undefined) return value.stringValue;
  if (value.integerValue !== undefined) return parseInt(value.integerValue, 10);
  if (value.doubleValue !== undefined) return parseFloat(value.doubleValue);
  if (value.booleanValue !== undefined) return value.booleanValue;
  if (value.nullValue !== undefined) return null;
  if (value.timestampValue !== undefined) return value.timestampValue;
  
  if (value.arrayValue !== undefined) {
    if (!value.arrayValue.values) return [];
    return value.arrayValue.values.map(v => parseFirestoreValue(v));
  }
  
  if (value.mapValue !== undefined) {
    if (!value.mapValue.fields) return {};
    const obj = {};
    for (const key of Object.keys(value.mapValue.fields)) {
      obj[key] = parseFirestoreValue(value.mapValue.fields[key]);
    }
    return obj;
  }
  return value;
}

async function run() {
  const firestoreUrl = 'https://firestore.googleapis.com/v1/projects/gen-lang-client-0858097960/databases/ai-studio-8b45955a-b902-4ba8-8a93-bd5476d4b9d2/documents/contents?key=AIzaSyCKiukLUs8DlGvE8CU_R4iXYxB6Yt-IanU&pageSize=1000';
  
  try {
    console.log("Fetching from Firebase...");
    const res = await fetch(firestoreUrl);
    const data = await res.json();
    
    if (!data.documents) {
      console.log("No documents found in Firebase.");
      return;
    }
    
    const items = data.documents.map(doc => {
      const id = doc.name.split('/').pop();
      const obj = { id };
      for (const key of Object.keys(doc.fields || {})) {
        obj[key] = parseFirestoreValue(doc.fields[key]);
      }
      return obj;
    });
    
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
