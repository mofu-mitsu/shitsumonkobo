import * as fs from 'fs';

let content = fs.readFileSync('src/App.tsx', 'utf8');

if (!content.includes('Search')) {
  content = content.replace(/import { Sparkles/, 'import { Search, Sparkles');
}

const stateRegex = /const \[myContents, setMyContents\] = useState<ShitsumonKobo_Content\[\]>\(\[\]\);/;
const replaceState = `const [myContents, setMyContents] = useState<ShitsumonKobo_Content[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState('newest');`;
content = content.replace(stateRegex, replaceState);

const viewRegex = /\{\/\* A\. みんなのギャラリービュー \*\/\}\n\s*\{activeView === 'gallery' && \(\n\s*<div className="space-y-4">/;
const replaceView = `{/* A. みんなのギャラリービュー */}
            {activeView === 'gallery' && (
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row gap-3 justify-between items-center bg-white/70 p-3 rounded-2xl border border-sky-100 shadow-sm">
                  <div className="relative w-full sm:w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                    <input 
                      type="text" 
                      placeholder="キーワードで検索..." 
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-sky-400"
                    />
                  </div>
                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <span className="text-[10px] font-bold text-slate-500">並び順</span>
                    <select 
                      value={sortOrder}
                      onChange={e => setSortOrder(e.target.value)}
                      className="bg-white border border-slate-200 text-xs px-2 py-1.5 rounded-xl text-slate-600 focus:outline-none focus:border-sky-400"
                    >
                      <option value="newest">新着順</option>
                      <option value="oldest">古い順</option>
                    </select>
                  </div>
                </div>`;
content = content.replace(viewRegex, replaceView);

const mapRegex = /\{publicContents\.map\(\(item\) => \{/g;
const replaceMap = `{publicContents.filter(item => item.title.includes(searchQuery) || (item.description || '').includes(searchQuery)).sort((a, b) => sortOrder === 'newest' ? new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime() : new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()).map((item) => {`;
content = content.replace(mapRegex, replaceMap);

fs.writeFileSync('src/App.tsx', content);
