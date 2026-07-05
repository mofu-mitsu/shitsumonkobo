const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

const oldInit = `          let merged = [...serverHistory];
          localHistory.forEach(localItem => {
            if (!merged.find(m => m.id === localItem.id)) {
              merged.push(localItem);
            }
          });
          if (merged.length > 30) merged = merged.slice(0, 30);

          setPlayHistory(merged);
          localStorage.setItem("shitsumonkobo_history", JSON.stringify(merged));
          if (localHistory.length > 0) {
            await syncUserPlayHistory(user.uid, merged);
          }`;

const newInit = `          let merged = [...serverHistory];
          localHistory.forEach(localItem => {
            if (!merged.find(m => m.id === localItem.id)) {
              merged.push(localItem);
            }
          });
          
          const strippedMerged = merged.map(fullItem => ({
            id: fullItem.id,
            title: fullItem.title,
            type: fullItem.type,
            creatorName: fullItem.creatorName || "",
            description: fullItem.description ? fullItem.description.substring(0, 100) : "",
            themeColorMode: fullItem.themeColorMode || "auto",
            customColor: fullItem.customColor || "",
            iconUrl: fullItem.iconUrl?.startsWith('data:') ? '' : fullItem.iconUrl,
            coverImageUrl: fullItem.coverImageUrl?.startsWith('data:') ? '' : fullItem.coverImageUrl
          })) as unknown as ShitsumonKobo_Content[];

          if (strippedMerged.length > 30) strippedMerged.splice(30);

          setPlayHistory(strippedMerged);
          try {
            localStorage.setItem("shitsumonkobo_history", JSON.stringify(strippedMerged));
          } catch(e){}
          if (localHistory.length > 0) {
            await syncUserPlayHistory(user.uid, strippedMerged);
          }`;

code = code.replace(oldInit, newInit);
fs.writeFileSync('src/App.tsx', code);
console.log("Patched init history");
