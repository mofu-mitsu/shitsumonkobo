import fetch from 'node-fetch';

async function fetchCollection(collectionId) {
  const url = `https://firestore.googleapis.com/v1/projects/gen-lang-client-0858097960/databases/ai-studio-8b45955a-b902-4ba8-8a93-bd5476d4b9d2/documents/${collectionId}?key=AIzaSyCKiukLUs8DlGvE8CU_R4iXYxB6Yt-IanU&pageSize=1000`;
  const res = await fetch(url);
  const data = await res.json();
  return data;
}

async function run() {
  const p = await fetchCollection('playLogs');
  console.log('playLogs', p.documents ? p.documents.length : 0);
  const u = await fetchCollection('userPlayHistory');
  console.log('userPlayHistory', u.documents ? u.documents.length : 0);
}
run();
