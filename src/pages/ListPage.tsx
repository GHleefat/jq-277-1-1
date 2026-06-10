import React from 'react';
import { GameList } from '@/components/GameList';

const ListPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-100 via-amber-50 to-stone-100">
      <div className="absolute inset-0 opacity-5 pointer-events-none" style={{
        backgroundImage: `repeating-linear-gradient(45deg, #8B2500 0, #8B2500 1px, transparent 0, transparent 50%),
                          repeating-linear-gradient(-45deg, #8B2500 0, #8B2500 1px, transparent 0, transparent 50%)`,
        backgroundSize: '40px 40px'
      }} />
      <div className="relative max-w-6xl mx-auto px-6 py-10">
        <div className="mb-8 text-center">
          <div className="inline-flex items-center gap-3 mb-2">
            <span className="text-5xl" style={{ fontFamily: "'Noto Serif SC', serif" }}>象</span>
            <span className="text-5xl text-red-800" style={{ fontFamily: "'Noto Serif SC', serif" }}>棋</span>
            <span className="text-5xl" style={{ fontFamily: "'Noto Serif SC', serif" }}>棋</span>
            <span className="text-5xl text-red-800" style={{ fontFamily: "'Noto Serif SC', serif" }}>谱</span>
          </div>
          <p className="text-stone-500 text-sm tracking-wide">记录每一局精彩对弈 · 回放复盘分析 · 导出专业棋谱</p>
        </div>
        <GameList />
      </div>
    </div>
  );
};

export default ListPage;
