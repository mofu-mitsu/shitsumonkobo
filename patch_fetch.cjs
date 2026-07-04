const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

const newFetch = `  const fetchPublicList = async (retryCount = 0) => {
    try {
      let list = await getPublicContents();
      const dbIds = list.map(item => item.id);
      const missingSamples = initialSamples.filter(sample => !dbIds.includes(sample.id)).map(s => ({...s, isDefault: true}));
      list = [...list, ...missingSamples];
      setPublicContents(list);
      try { localStorage.setItem("shitsumonkobo_public_cache", JSON.stringify(list)); } catch (e) {}
    } catch (error) {
      console.error("サーバーから公開リストの取得に失敗しました:", error);
      if (retryCount < 2) {
        setTimeout(() => fetchPublicList(retryCount + 1), 2000);
      } else {
        setPublicContents(initialSamples.map(s => ({...s, isDefault: true})));
      }
    }
  };`;

code = code.replace(/const fetchPublicList = async \(\) => \{[\s\S]*?\}\s*catch \(\w+\) \{[\s\S]*?\}\n  \};/, newFetch);

fs.writeFileSync('src/App.tsx', code);
console.log("Patched fetchPublicList");
