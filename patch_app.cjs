const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

const oldLaunch = `  // 選択してプレイ
  const launchPlayer = (item: ShitsumonKobo_Content, showDash: boolean = false) => {
    playSound("synth");
    setTargetContent(item);
    setInitDashboard(showDash);
    setAppMode('playing');

    try {
      setPlayHistory(prev => {
        let history = prev.filter(h => h.id !== item.id);
        history.unshift(item);
        if (history.length > 30) history = history.slice(0, 30);
        localStorage.setItem("shitsumonkobo_history", JSON.stringify(history));
        
        if (currentUser) {
          syncUserPlayHistory(currentUser.uid, history).catch(console.error);
        }
        
        return history;
      });
    } catch(e) {}
  };`;

const newLaunch = `  // 選択してプレイ
  const launchPlayer = async (item: ShitsumonKobo_Content, showDash: boolean = false) => {
    playSound("synth");
    
    let fullItem = item;
    // If it's a minimal history item (missing questions)
    if (!item.questions) {
      // First check local myContents
      const myItem = myContents.find(m => m.id === item.id);
      if (myItem && myItem.questions) {
        fullItem = myItem;
      } else {
        // Fetch from API/Firestore
        try {
          const res = await fetch(\`/api/contents/\${item.id}\`);
          if (res.ok) {
            fullItem = await res.json();
          } else {
            console.error("Could not fetch full content");
            return;
          }
        } catch (e) {
          console.error(e);
          return;
        }
      }
    }
    
    setTargetContent(fullItem);
    setInitDashboard(showDash);
    setAppMode('playing');

    try {
      setPlayHistory(prev => {
        let history = prev.filter(h => h.id !== fullItem.id);
        
        // Make a stripped version to save in history
        const minimalItem = {
          id: fullItem.id,
          title: fullItem.title,
          type: fullItem.type,
          creatorName: fullItem.creatorName || "",
          description: fullItem.description ? fullItem.description.substring(0, 100) : "",
          themeColorMode: fullItem.themeColorMode || "auto",
          customColor: fullItem.customColor || "",
          iconUrl: fullItem.iconUrl?.startsWith('data:') ? '' : fullItem.iconUrl,
          coverImageUrl: fullItem.coverImageUrl?.startsWith('data:') ? '' : fullItem.coverImageUrl
        } as unknown as ShitsumonKobo_Content;
        
        let newHistory = prev.filter(h => h.id !== fullItem.id);
        newHistory.unshift(minimalItem);
        if (newHistory.length > 30) newHistory = newHistory.slice(0, 30);
        
        try {
          localStorage.setItem("shitsumonkobo_history", JSON.stringify(newHistory));
        } catch(e) {
          console.error("Storage error:", e);
        }
        
        if (currentUser) {
          syncUserPlayHistory(currentUser.uid, newHistory).catch(console.error);
        }
        
        return newHistory;
      });
    } catch(e) {}
  };`;

code = code.replace(oldLaunch, newLaunch);
fs.writeFileSync('src/App.tsx', code);
console.log("Patched App.tsx");
