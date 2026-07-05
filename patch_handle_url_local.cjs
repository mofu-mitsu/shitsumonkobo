const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

const searchStr = `        } catch (err) {
          console.error("共有しつもんのロード中に通信エラーが発生しました:", err);
        }
      }`;

const replacement = `        } catch (err) {
          console.error("共有しつもんのロード中に通信エラーが発生しました:", err);
        }
        
        // ローカルフォールバック
        const raw = localStorage.getItem("my_shitsumonkobo_studio");
        if (raw) {
          try {
            const localList = JSON.parse(raw);
            const found = localList.find(item => item.id === sharedId);
            if (found) {
              setTargetContent(found);
              setAppMode('playing');
              playSound("bell");
            }
          } catch(e) {}
        }
      }`;

code = code.replace(searchStr, replacement);
fs.writeFileSync('src/App.tsx', code);
console.log("Patched handleUrlQuery local fallback");
