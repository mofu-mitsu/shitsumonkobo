import React from 'react';
import { motion } from 'motion/react';

export default function WeatherEffect({ type }: { type: string }) {
  if (!type || type === 'none') return null;
  
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden opacity-40 z-0">
      {Array.from({ length: 20 }).map((_, i) => (
         <motion.div
           key={i}
           initial={{ y: -50, x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 800) }}
           animate={{ 
             y: typeof window !== 'undefined' ? window.innerHeight + 100 : 800, 
             x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 800) + (Math.random() < 0.5 ? -100 : 100),
             rotate: Math.random() * 360
           }}
           transition={{ 
             duration: Math.random() * 3 + 5, 
             repeat: Infinity, 
             ease: "linear",
             delay: Math.random() * 5 
           }}
           className="absolute text-xl"
         >
           {type === 'snow' ? "❄️"
           : type === 'petals' ? "🌸"
           : type === 'stars' ? "✨"
           : type === 'leaves' ? "🍂"
           : type === 'rain' ? <div className="w-0.5 h-6 bg-sky-400 opacity-50 rotate-12"></div>
           : ""}
         </motion.div>
      ))}
    </div>
  );
}
