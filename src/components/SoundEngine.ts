/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// Web Audio API を用いた完全にセルフスタンドな効果音エンジンです。
// 通常の AudioContext インスタンスの累積上限に達しないよう、シングルトンで使い回します。
let sharedCtx: AudioContext | null = null;

export function playSound(type: 'bell' | 'synth' | 'bloop' | 'kick') {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    
    if (!sharedCtx) {
      sharedCtx = new AudioContextClass();
    }
    const ctx = sharedCtx;
    
    // ブラウザが自動再生を制限している場合は、ユーザーのタップを検知して都度 resume させる
    if (ctx.state === 'suspended') {
      ctx.resume();
    }
    
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    const now = ctx.currentTime;
    
    switch (type) {
      case 'bell':
        // チーンという涼しげなベルの音
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(880, now); // A5
        osc.frequency.exponentialRampToValueAtTime(1760, now + 0.1); // 倍音効果
        gain.gain.setValueAtTime(0.3, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.8);
        osc.start(now);
        osc.stop(now + 0.82);
        break;
        
      case 'synth':
        // ピコッというポップな電子音
        osc.type = 'sine';
        osc.frequency.setValueAtTime(440, now);
        osc.frequency.exponentialRampToValueAtTime(1200, now + 0.08);
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
        osc.start(now);
        osc.stop(now + 0.26);
        break;
        
      case 'bloop':
        // ププッというレトロな警告・スキップ音
        osc.type = 'square';
        osc.frequency.setValueAtTime(300, now);
        osc.frequency.setValueAtTime(150, now + 0.05);
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
        osc.start(now);
        osc.stop(now + 0.16);
        break;
        
      case 'kick':
        // 三角波（triangle）と高めのアタック周波数を組み合わせることで、スマホスピーカーでもはっきりと「ポン！」「ポコッ！」と鳴り響く極上の打撃音にします
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(280, now); // 高い周波数から一気に急降下させるアタック感
        osc.frequency.exponentialRampToValueAtTime(60, now + 0.1); 
        gain.gain.setValueAtTime(1.0, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
        osc.start(now);
        osc.stop(now + 0.32);
        break;
    }
  } catch (error) {
    console.warn("効果音再生がブロックされました。", error);
  }
}
