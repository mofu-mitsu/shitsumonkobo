const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

const searchStr = `        if (Array.isArray(parsed) && parsed.length > 5) {
          localStorage.setItem(key, JSON.stringify(parsed.slice(0, 5)));
        }
      } catch(err) {}
    }`;

const replacement = `        if (Array.isArray(parsed) && parsed.length > 5) {
          localStorage.setItem(key, JSON.stringify(parsed.slice(0, 5)));
        }
      } catch(err) {}
    } else if (key === "shitsumonkobo_public_cache") {
      try {
        const parsed = JSON.parse(value);
        if (Array.isArray(parsed)) {
          const stripped = parsed.map(item => {
            const copy = {...item};
            if (copy.coverImageUrl && copy.coverImageUrl.startsWith('data:image')) delete copy.coverImageUrl;
            if (copy.results) copy.results = [];
            return copy;
          });
          localStorage.setItem(key, JSON.stringify(stripped));
        }
      } catch (err) {}
    }`;

code = code.replace(searchStr, replacement);
fs.writeFileSync('src/App.tsx', code);
console.log("Patched safeSetStorage fallback");
