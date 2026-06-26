import * as fs from 'fs';

let playerStr = fs.readFileSync('src/components/ContentPlayer.tsx', 'utf8');

const newCalculateResult = `
  const calculateResult = (): ShitsumonKobo_ResultOption => {
    const finalScores = doAggregateScores();

    // たたきゲームのボーナス
    if (beatTapsScore > 0) {
      if (content.gimmicks?.tapBeatAttributeMultiplier && Object.keys(content.gimmicks.tapBeatAttributeMultiplier).length > 0) {
        Object.entries(content.gimmicks.tapBeatAttributeMultiplier).forEach(([attr, multi]) => {
          if (attr !== 'gacha_point') {
            finalScores[attr] = (finalScores[attr] || 0) + (beatTapsScore * multi);
          }
        });
      } else {
        const key = content.scoringAttributes[0] || "BonusPoints";
        finalScores[key] = (finalScores[key] || 0) + beatTapsScore;
      }
    }

    // 評価
    let matchOptions = content.results.filter(r => {
      const type = r.conditionType || 'threshold';
      
      if (type === 'threshold') {
        const score = finalScores[r.conditionAttribute] || 0;
        return score >= r.conditionScoreMin;
      }
      
      if (type === 'expression' && r.advancedCondition) {
        try {
          let evalStr = r.advancedCondition;
          Object.entries(finalScores).forEach(([k, v]) => {
            evalStr = evalStr.replace(new RegExp(\`\\\\b\${k}\\\\b\`, 'g'), v.toString());
          });
          evalStr = evalStr.replace(/[a-zA-Z_]+/g, '0');
          return new Function('return ' + evalStr)();
        } catch(e) {
          return false;
        }
      }

      if (type === 'attribute_order' && r.conditionOrder && r.conditionOrder.length > 0) {
        // 並び順判定
        const sortedAttrs = Object.keys(finalScores).sort((a, b) => finalScores[b] - finalScores[a]);
        // 指定された順序が上位から一致しているか確認
        return r.conditionOrder.every((attr, idx) => sortedAttrs[idx] === attr);
      }

      if (type === 'attribute_sum' && r.conditionSumAttributes && r.conditionSumAttributes.length > 0) {
        const sum = r.conditionSumAttributes.reduce((acc, attr) => acc + (finalScores[attr] || 0), 0);
        return sum >= r.conditionScoreMin;
      }

      return false;
    });

    if (matchOptions.length > 0) {
      // 複数マッチした場合は、thresholdならscoreMinが高い順、他は登録順（最初）を優先する
      const sorted = matchOptions.sort((a, b) => {
        if (a.conditionType === 'threshold' && b.conditionType === 'threshold') {
          return b.conditionScoreMin - a.conditionScoreMin;
        }
        return 0; // 他の条件はそのまま
      });
      return sorted[0];
    }

    // 完全なフォールバック
    return content.results[0] || {
      id: "fallback_result",
      title: "知的好奇心のあふれる探索者 🌟",
      description: "すべてのアライメントが均衡している、とてもユニークな心境を示しています！",
      imageUrl: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=600",
      conditionAttribute: "",
      conditionScoreMin: 0
    };
  };
`;

playerStr = playerStr.replace(/const calculateResult = \(\): ShitsumonKobo_ResultOption => \{[\s\S]*?const finalResult = isFinished \? calculateResult\(\) : null;/, newCalculateResult.trim() + "\n\n  const finalResult = isFinished && content.type !== 'survey' ? calculateResult() : null;");

const surveyEndScreen = `
        {/* =============== アンケートの専用終了画面 =============== */}
        {isFinished && content.type === 'survey' && (
          <div className="max-w-2xl mx-auto w-full space-y-6">
            <div className="bg-white border border-sky-100 rounded-3xl p-6 md:p-8 space-y-6 shadow-sm relative overflow-hidden text-center">
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-teal-400 via-emerald-400 to-sky-400" />
              
              <div className="space-y-2">
                <div className="text-sm font-bold text-teal-600 bg-teal-50 inline-block px-3 py-1 rounded-full border border-teal-100">
                  ご協力ありがとうございました！
                </div>
                <h3 className="text-2xl font-black text-slate-800">
                  アンケート完了
                </h3>
              </div>

              <div className="text-sm text-slate-600">
                あなたの回答が送信されました。ご協力ありがとうございます。
              </div>

              {content.surveyShowStats && (
                <div className="bg-slate-50 border border-slate-100 p-4 rounded-2xl text-left space-y-4">
                  <h4 className="font-bold text-slate-700 text-sm text-center">📊 現在の投票率（モック）</h4>
                  <div className="space-y-3">
                    {/* Mock stats display */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs font-bold text-slate-600"><span>A. とてもそう思う</span><span>45%</span></div>
                      <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden"><div className="h-full bg-teal-400 w-[45%]" /></div>
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs font-bold text-slate-600"><span>B. どちらともいえない</span><span>30%</span></div>
                      <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden"><div className="h-full bg-teal-400 w-[30%]" /></div>
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs font-bold text-slate-600"><span>C. あまりそう思わない</span><span>25%</span></div>
                      <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden"><div className="h-full bg-teal-400 w-[25%]" /></div>
                    </div>
                  </div>
                </div>
              )}

              <button
                onClick={resetPlay}
                className="mx-auto block px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-all shadow-sm border border-slate-200 cursor-pointer text-sm"
              >
                もう一度回答する
              </button>
            </div>
          </div>
        )}
`;

playerStr = playerStr.replace(/\{isFinished && finalResult && \(/, surveyEndScreen + "\n        {/* =============== 回答終了の結果画面 =============== */}\n        {isFinished && finalResult && content.type !== 'survey' && (");

fs.writeFileSync('src/components/ContentPlayer.tsx', playerStr);
