import React from 'react';
import { Globe, Calculator, History, Award, BarChart3 } from 'lucide-react';

interface HeaderProps {
  activeTab: 'calculate' | 'results' | 'pledges' | 'history';
  setActiveTab: (tab: 'calculate' | 'results' | 'pledges' | 'history') => void;
  hasCalculated: boolean;
  onWarning?: (msg: string) => void;
}

export default function Header({ activeTab, setActiveTab, hasCalculated, onWarning }: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-xs border-b border-brand-green-100 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          
          {/* Brand Logo and Slogan */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('calculate')}>
            <div className="w-11 h-11 bg-brand-green-600 rounded-full flex items-center justify-center text-white serif italic text-xl shadow-xs transition-transform hover:scale-105">
              C
            </div>
            <div>
              <h1 className="text-xl serif font-extrabold tracking-tight text-slate-800 flex items-center gap-1.5">
                CarbonClarity
              </h1>
              <p className="text-[9px] text-brand-green-500 font-bold tracking-[0.18em] uppercase hidden sm:block">
                Understand • Track • Reduce
              </p>
            </div>
          </div>

          {/* Tab Navigation Menu */}
          <nav className="flex space-x-1 sm:space-x-3">
            <button
              id="nav-calculate"
              onClick={() => setActiveTab('calculate')}
              className={`flex items-center gap-1 sm:gap-1.5 px-3 py-2 rounded-xl text-[10px] sm:text-[11px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
                activeTab === 'calculate'
                  ? 'bg-brand-green-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-brand-green-50'
              }`}
            >
              <Calculator className="h-3.5 w-3.5" />
              <span className="hidden xs:inline">Calculate</span>
            </button>

            <button
              id="nav-results"
              onClick={() => {
                if (hasCalculated) {
                  setActiveTab('results');
                } else {
                  if (onWarning) {
                    onWarning("Please fill in your assessment metrics and run the carbon calculation first to unlock your personalized Dashboard results!");
                  } else {
                    alert("Please enter your lifestyle data and calculate first!");
                  }
                }
              }}
              className={`flex items-center gap-1 sm:gap-1.5 px-3 py-2 rounded-xl text-[10px] sm:text-[11px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
                !hasCalculated ? 'opacity-40 cursor-not-allowed' : ''
              } ${
                activeTab === 'results'
                  ? 'bg-brand-green-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-brand-green-50'
              }`}
            >
              <BarChart3 className="h-3.5 w-3.5" />
              <span className="hidden xs:inline">Dashboard</span>
            </button>

            <button
              id="nav-pledges"
              onClick={() => {
                setActiveTab('pledges');
              }}
              className={`flex items-center gap-1 sm:gap-1.5 px-3 py-2 rounded-xl text-[10px] sm:text-[11px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
                activeTab === 'pledges'
                  ? 'bg-brand-green-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-brand-green-50'
              }`}
            >
              <Award className="h-3.5 w-3.5" />
              <span className="hidden xs:inline">Pledges</span>
            </button>

            <button
              id="nav-history"
              onClick={() => setActiveTab('history')}
              className={`flex items-center gap-1 sm:gap-1.5 px-3 py-2 rounded-xl text-[10px] sm:text-[11px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
                activeTab === 'history'
                  ? 'bg-brand-green-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-brand-green-50'
              }`}
            >
              <History className="h-3.5 w-3.5" />
              <span className="hidden xs:inline">History</span>
            </button>
          </nav>

        </div>
      </div>
    </header>
  );
}
