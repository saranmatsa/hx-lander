'use client';

import React from 'react';
import { HxSymbol } from './HxLogo';
import { ArrowRight, Sparkles, Layers, Cpu } from 'lucide-react';

interface NavbarProps {
  activeTab: 'home' | 'cfd' | 'mbse' | 'benchmarks';
  setActiveTab: (tab: 'home' | 'cfd' | 'mbse' | 'benchmarks') => void;
  onOpenWaitlist: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab, onOpenWaitlist }) => {
  return (
    <header className="sticky top-0 z-40 w-full bg-black/90 backdrop-blur-md border-b border-zinc-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Top-Left Logo */}
        <button
          onClick={() => setActiveTab('home')}
          className="flex items-center space-x-3 text-white hover:opacity-80 transition-opacity focus:outline-none"
        >
          <HxSymbol className="h-6 w-auto text-white" />
          <span className="hidden sm:inline font-mono text-xs uppercase tracking-widest text-zinc-400 font-semibold border-l border-zinc-800 pl-3">
            Platform
          </span>
        </button>

        {/* Center Nav tabs */}
        <nav className="hidden md:flex items-center space-x-1 bg-zinc-950 p-1 border border-zinc-800/80 rounded-full">
          <button
            onClick={() => setActiveTab('home')}
            className={`px-4 py-1.5 rounded-full text-xs font-mono uppercase tracking-wider transition-all ${
              activeTab === 'home'
                ? 'bg-white text-black font-semibold shadow-sm'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            Overview
          </button>

          <button
            onClick={() => setActiveTab('cfd')}
            className={`flex items-center space-x-1.5 px-4 py-1.5 rounded-full text-xs font-mono uppercase tracking-wider transition-all ${
              activeTab === 'cfd'
                ? 'bg-white text-black font-semibold shadow-sm'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Cpu className="w-3.5 h-3.5" />
            <span>HX CFD</span>
          </button>

          <button
            onClick={() => setActiveTab('mbse')}
            className={`flex items-center space-x-1.5 px-4 py-1.5 rounded-full text-xs font-mono uppercase tracking-wider transition-all ${
              activeTab === 'mbse'
                ? 'bg-white text-black font-semibold shadow-sm'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>HX MBSE</span>
          </button>

          <button
            onClick={() => setActiveTab('benchmarks')}
            className={`px-4 py-1.5 rounded-full text-xs font-mono uppercase tracking-wider transition-all ${
              activeTab === 'benchmarks'
                ? 'bg-white text-black font-semibold shadow-sm'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            Benchmarks
          </button>
        </nav>

        {/* Right CTA */}
        <div className="flex items-center space-x-3">
          <button
            onClick={onOpenWaitlist}
            className="bg-white hover:bg-zinc-200 text-black font-semibold text-xs py-2 px-4 rounded-full uppercase tracking-wider transition-all flex items-center space-x-1.5 shadow-md shadow-white/5"
          >
            <span>JOIN WAITLIST</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </header>
  );
};