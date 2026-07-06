import fetch from 'node-fetch';
async function run() {
  const url = 'https://firestore.googleapis.com/v1/projects/gen-lang-client-0858097960/databases/ai-studio-8b45955a-b902-4ba8-8a93-bd5476d4b9d2/documents/contents?key=AIzaSyCKiukLUs8DlGvE8CU_R4iXYxB6Yt-IanU';
  const res = await fetch(url);
  console.log(await res.text());
}
run();
