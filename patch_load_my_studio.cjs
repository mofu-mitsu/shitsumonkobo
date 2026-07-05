const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

const searchStr = `  const loadMyStudio = async (userId: string) => {
    try {
      const list = await getMyContents(userId);
      // ローカルのものとマージする
      const raw = localStorage.getItem("my_shitsumonkobo_studio");
      let localList: ShitsumonKobo_Content[] = [];
      if (raw) {
        localList = JSON.parse(raw);
      }
      const allList = [...list];
      localList.forEach(localItem => {
        if (!allList.find(item => item.id === localItem.id)) {
          allList.push(localItem);
        }
      });
      setMyContents(allList);
    } catch (error) {
      console.error("自分のコンテンツの取得に失敗しました:", error);
    }
  };`;

const replacement = `  const loadMyStudio = async (userId: string) => {
    let list: ShitsumonKobo_Content[] = [];
    try {
      list = await getMyContents(userId);
    } catch (error) {
      console.error("自分のコンテンツの取得に失敗しました:", error);
    }
    // ローカルのものとマージする (Firebaseが失敗してもローカルは表示する)
    try {
      const raw = localStorage.getItem("my_shitsumonkobo_studio");
      let localList: ShitsumonKobo_Content[] = [];
      if (raw) {
        localList = JSON.parse(raw);
      }
      const allList = [...list];
      localList.forEach(localItem => {
        if (!allList.find(item => item.id === localItem.id)) {
          allList.push(localItem);
        }
      });
      setMyContents(allList);
    } catch(e) {}
  };`;

code = code.replace(searchStr, replacement);
fs.writeFileSync('src/App.tsx', code);
console.log("Patched loadMyStudio");
