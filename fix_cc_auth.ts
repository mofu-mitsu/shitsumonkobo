import * as fs from 'fs';

let ccStr = fs.readFileSync('src/components/ContentCreator.tsx', 'utf8');

if (!ccStr.includes('import { User } from "firebase/auth";')) {
  ccStr = ccStr.replace(
    /import ContentPlayer from "\.\/ContentPlayer";/,
    `import ContentPlayer from "./ContentPlayer";\nimport { User } from "firebase/auth";`
  );
}

if (!ccStr.includes('currentUser?: User | null;')) {
  ccStr = ccStr.replace(
    /interface ContentCreatorProps \{/,
    `interface ContentCreatorProps {\n  currentUser?: User | null;`
  );
}

if (!ccStr.includes('currentUser, initialContent')) {
  ccStr = ccStr.replace(
    /export default function ContentCreator\(\{ season, onSave, onCancel, initialContent \}: ContentCreatorProps\) \{/,
    `export default function ContentCreator({ season, onSave, onCancel, initialContent, currentUser }: ContentCreatorProps) {`
  );
}

// クリエイター名に X アカウントの情報を利用するトグル等を追加
if (!ccStr.includes('content.creatorXHandle')) {
  ccStr = ccStr.replace(
    /<input\s+type="text"\s+placeholder="あなたの名前"\s+value=\{content\.creatorName\}/,
    `{currentUser && (
                    <div className="mb-2 flex flex-col gap-2">
                      <label className="flex items-center gap-2 cursor-pointer select-none text-sm text-slate-700">
                        <input 
                          type="checkbox" 
                          checked={!!content.creatorXHandle}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setContent({ ...content, creatorXHandle: currentUser.displayName || "X_User" });
                            } else {
                              setContent({ ...content, creatorXHandle: undefined });
                            }
                          }}
                        />
                        <span>Xのアカウント名({currentUser.displayName})を作者名に表示する</span>
                      </label>
                      {content.creatorXHandle && (
                        <div className="flex items-center gap-2 text-xs text-slate-500 ml-5">
                          <X size={12}/> 作者名として公開されます
                        </div>
                      )}
                    </div>
                  )}
                  <input
                    type="text"
                    placeholder="あなたの名前"
                    value={content.creatorName}`
  );
}

// 投票率公開するかどうかのトグル
if (!ccStr.includes('surveyShowStats')) {
  ccStr = ccStr.replace(
    /\{content\.type === 'quiz' && \(/,
    `{content.type === 'survey' && (
                <div className="bg-sky-50 p-4 rounded-xl space-y-3">
                  <div className="font-bold text-sky-800 text-sm border-b border-sky-100 pb-2">アンケート設定</div>
                  <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={content.surveyShowStats ?? true}
                      onChange={(e) => setContent({...content, surveyShowStats: e.target.checked})}
                    />
                    <span>アンケート終了後に全員の投票割合（％）を公開する</span>
                  </label>
                </div>
              )}
              {content.type === 'quiz' && (`
  );
}

fs.writeFileSync('src/components/ContentCreator.tsx', ccStr);
