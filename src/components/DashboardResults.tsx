import React from 'react';
import { 
  ResponsiveContainer, PieChart, Pie, Cell, Tooltip as ChartTooltip, Legend as ChartLegend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid
} from 'recharts';
import { 
  Sparkles, Leaf, Compass, ShieldAlert, CheckCircle, 
  Car, Home, Utensils, Award, TrendingDown, ArrowRight, RefreshCw
} from 'lucide-react';
import { AIInsightsResponse, EmissionBreakdown, CarbonFootprintInputs, CarbonPledge, ActionItem } from '../types.js';

interface DashboardResultsProps {
  inputs: CarbonFootprintInputs;
  breakdown: EmissionBreakdown;
  insights: AIInsightsResponse;
  isLoading: boolean;
  onAddPledge: (pledge: Omit<CarbonPledge, 'id' | 'datePledged' | 'status'>) => void;
  activePledges: CarbonPledge[];
}

// Colors for Recharts Categories
const CATEGORY_COLORS = {
  transport: '#a44d36',     // Terracotta Warm Red
  homeEnergy: '#c6c6b4',    // Warm stone gray-olive
  dietLifestyle: '#5a5a40', // Deep organic olive
};

export default function DashboardResults({ 
  inputs, 
  breakdown, 
  insights, 
  isLoading, 
  onAddPledge,
  activePledges
}: DashboardResultsProps) {

  const totalTonnes = breakdown.total / 1000;

  // Preparing data for Pie Chart
  const pieData = React.useMemo(() => [
    { name: 'Transport & Flights', value: breakdown.transport, color: CATEGORY_COLORS.transport },
    { name: 'Utilities & Home Energy', value: breakdown.homeEnergy, color: CATEGORY_COLORS.homeEnergy },
    { name: 'Diet & Lifestyle Habits', value: breakdown.dietLifestyle, color: CATEGORY_COLORS.dietLifestyle }
  ].filter(item => item.value > 0), [breakdown]);

  // Preparing data for comparisons
  const barData = React.useMemo(() => insights.comparisons || [
    { label: 'Your Footprint', value: parseFloat(totalTonnes.toFixed(2)) },
    { label: 'World Average', value: 4.7 },
    { label: 'UK Average', value: 6.5 },
    { label: 'US Average', value: 16.0 },
    { label: 'Sustainable Target', value: 2.0 }
  ], [insights.comparisons, totalTonnes]);

  // Helper to check if an action item is already pledged
  const isPledged = (title: string) => {
    return activePledges.some(p => p.actionTitle === title);
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      
      {/* 1. Header Overview Cards */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Metric total */}
        <div className="bg-white border border-brand-green-100 rounded-[32px] p-6 flex flex-col justify-between shadow-xs">
          <div className="flex items-center justify-between border-b border-brand-green-50 pb-3 mb-4">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Your Impact</span>
            <Leaf className="h-5 w-5 text-brand-green-600" />
          </div>
          <div className="space-y-1">
            <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Annual Emissions</h4>
            <div className="flex items-baseline space-x-1">
              <span className="text-[44px] font-extrabold serif text-slate-800 leading-none">{totalTonnes.toFixed(2)}</span>
              <span className="text-xs font-bold text-slate-500">t CO₂e</span>
            </div>
          </div>
          <p className="text-xs text-slate-500 mt-4 leading-relaxed font-normal">
            {totalTonnes < 3 ? '🎉 Excellent! You are very close to the sustainable target limit.' : 
             totalTonnes < 7 ? '⚖️ Your footprint is near regional averages, but holds easy margins to prune.' : 
             '⚠️ High footprint alert. Explore the Gemini decarbonization plan below to target key categories.'}
          </p>
        </div>

        {/* Global delta comparison */}
        <div className="bg-white border border-brand-green-100 rounded-[32px] p-6 flex flex-col justify-between shadow-xs">
          <div className="flex items-center justify-between border-b border-brand-green-50 pb-3 mb-4">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Global Benchmarks</span>
            <TrendingDown className="h-5 w-5 text-brand-green-500" />
          </div>
          <div className="space-y-1">
            <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Vs. Sustainable Target</h4>
            <div className="flex items-baseline space-x-1">
              <span className={`text-[44px] font-extrabold serif leading-none ${totalTonnes <= 2.0 ? 'text-brand-green-500' : 'text-amber-700'}`}>
                {totalTonnes <= 2.0 ? '' : '+'}{((totalTonnes - 2.0) * 100 / 2.0).toFixed(0)}%
              </span>
              <span className="text-xs font-bold text-slate-500">over 2.0t target</span>
            </div>
          </div>
          <p className="text-xs text-slate-500 mt-4 leading-relaxed font-normal">
            International climatologists set a 2030 threshold of <strong className="text-slate-700">2.0 tonnes</strong> per person annually to curb warming trends.
          </p>
        </div>

        {/* Active Pledges counters */}
        <div className="bg-white border border-brand-green-100 rounded-[32px] p-6 flex flex-col justify-between shadow-xs">
          <div className="flex items-center justify-between border-b border-brand-green-50 pb-3 mb-4">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Pledges & Intent</span>
            <Award className="h-5 w-5 text-brand-green-600" />
          </div>
          <div className="space-y-1">
            <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Decarbonization Pledges</h4>
            <div className="flex items-baseline space-x-1">
              <span className="text-[44px] font-extrabold serif text-brand-green-600 leading-none">
                {activePledges.length}
              </span>
              <span className="text-xs font-bold text-slate-500">active saving goals</span>
            </div>
          </div>
          <div className="text-xs text-slate-600 mt-4 flex items-center gap-1.5 bg-[#f5f5f0] border border-brand-green-100 p-2.5 rounded-2xl">
            <span>🛡️ Potential savings from pledges:</span>
            <strong>{activePledges.reduce((sum, p) => sum + p.impactKg, 0)} kg CO₂e / yr</strong>
          </div>
        </div>

      </section>

      {/* 2. Visual Graphs Section */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Category Share (Pie Chart) */}
        <div className="bg-white border border-brand-green-100 rounded-[32px] p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-brand-green-50 pb-3">
            <h4 className="font-bold text-slate-800 text-xl serif flex items-center gap-2">
              <span>🥧</span> Category Share
            </h4>
            <span className="text-[10px] text-slate-400 font-mono">VALUES IN KG CO₂E</span>
          </div>
          <div className="h-64 sm:h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={85}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <ChartTooltip 
                  formatter={(value) => [`${value} kg CO₂e`, 'Emissions']}
                  contentStyle={{ outline: 'none', borderRadius: '16px', border: '1px solid #e5e5dc', fontSize: '11px' }}
                />
                <ChartLegend 
                  verticalAlign="bottom" 
                  height={36} 
                  iconType="circle"
                  wrapperStyle={{ fontSize: '11px', fontWeight: 550 }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-3 gap-2 text-center pt-2">
            <div className="p-2 bg-[#fdfaf8] border border-orange-100 rounded-2xl">
              <span className="block text-[10px] text-[#a44d36] font-bold uppercase">Transport</span>
              <span className="text-sm font-extrabold text-slate-800">{breakdown.transport} kg</span>
            </div>
            <div className="p-2 bg-[#fafaf8] border border-brand-green-100 rounded-2xl">
              <span className="block text-[10px] text-slate-500 font-bold uppercase">Utilities</span>
              <span className="text-sm font-extrabold text-slate-800">{breakdown.homeEnergy} kg</span>
            </div>
            <div className="p-2 bg-[#f5f5f0] border border-brand-green-200 rounded-2xl">
              <span className="block text-[10px] text-brand-green-600 font-bold uppercase">Diet/Life</span>
              <span className="text-sm font-extrabold text-slate-800">{breakdown.dietLifestyle} kg</span>
            </div>
          </div>
        </div>

        {/* Global comparisons (Bar Chart) */}
        <div className="bg-white border border-brand-green-100 rounded-[32px] p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-brand-green-50 pb-3">
            <h4 className="font-bold text-slate-800 text-xl serif flex items-center gap-2">
              <span>📊</span> Global Comparisons
            </h4>
            <span className="text-[10px] text-slate-400 font-mono">VALUES IN TONNES CO₂E/YR</span>
          </div>
          <div className="h-64 sm:h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData} margin={{ top: 10, right: 10, left: -25, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e5dc" />
                <XAxis dataKey="label" tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} />
                <YAxis tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} />
                <ChartTooltip 
                  formatter={(value) => [`${value} tonnes/year`, 'Footprint']}
                  contentStyle={{ outline: 'none', borderRadius: '16px', border: '1px solid #e5e5dc', fontSize: '11px' }}
                />
                <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                  {barData.map((entry, index) => {
                    const isSelf = entry.label.toLowerCase().includes('your');
                    const isTarget = entry.label.toLowerCase().includes('target');
                    let fill = '#c6c6b4'; // default stone
                    if (isSelf) fill = totalTonnes > 6 ? '#a44d36' : '#8b8b6b';
                    if (isTarget) fill = '#5a5a40'; // sustainability target matches beautiful dark green
                    return <Cell key={`cell-${index}`} fill={fill} />;
                  })}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <p className="text-[10.5px] text-center text-slate-400 italic">
            *Amber/red accents denote higher impacts, sage signals progressive alignment closer to sustainable 2.0t marks.
          </p>
        </div>

      </section>

      {/* 3. Gemini AI Insights Briefing Panel */}
      <section className="bg-brand-green-700 text-white rounded-[32px] p-6 sm:p-8 space-y-6 relative overflow-hidden shadow-xs border border-brand-green-600">
        
        {/* Backdrop highlights */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex items-center space-x-2 pb-3 border-b border-brand-green-600">
          <Sparkles className="h-6 w-6 text-brand-green-100 animate-pulse" />
          <div>
            <h3 className="text-xl font-bold serif text-white">Gemini AI Personalized Review</h3>
            <p className="text-[10px] tracking-wider uppercase font-semibold text-brand-green-150">Dynamic diagnostics and sector analyses using live parameters</p>
          </div>
        </div>

        {/* Main Analysis paragraph */}
        {isLoading ? (
          <div className="py-6 flex flex-col items-center justify-center space-y-3">
            <RefreshCw className="h-6 w-6 text-brand-green-100 animate-spin" />
            <p className="text-sm font-medium text-brand-green-100">Consulting cloud models and computing parameters...</p>
          </div>
        ) : (
          <p className="text-sm sm:text-base leading-relaxed text-[#fcfcf9] font-normal border-l-4 border-brand-green-100 pl-4 py-1 italic bg-white/5 rounded-r-xl pr-4">
            "{insights.totalAnalysis}"
          </p>
        )}

        {/* Three category split cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          
          {/* Transport Card */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-4 space-y-2">
            <div className="flex items-center gap-2">
              <div className="p-1 px-1.5 bg-white/10 rounded-lg">
                <Car className="h-4 w-4 text-brand-green-100" />
              </div>
              <span className="text-[10px] font-bold text-[#fafaf8] tracking-widest uppercase">Transportation</span>
            </div>
            <p className="text-[11.5px] leading-relaxed text-[#f1f1ea]">
              {insights.categoryBreakdown?.transport || "Analysis calculating..."}
            </p>
          </div>

          {/* Utilities Code */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-4 space-y-2">
            <div className="flex items-center gap-2">
              <div className="p-1 px-1.5 bg-white/10 rounded-lg">
                <Home className="h-4 w-4 text-brand-green-100" />
              </div>
              <span className="text-[10px] font-bold text-[#fafaf8] tracking-widest uppercase">Home Energy</span>
            </div>
            <p className="text-[11.5px] leading-relaxed text-[#f1f1ea]">
              {insights.categoryBreakdown?.homeEnergy || "Analysis calculating..."}
            </p>
          </div>

          {/* Diet Card */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-4 space-y-2">
            <div className="flex items-center gap-2">
              <div className="p-1 px-1.5 bg-white/10 rounded-lg">
                <Utensils className="h-4 w-4 text-brand-green-100" />
              </div>
              <span className="text-[10px] font-bold text-[#fafaf8] tracking-widest uppercase">Diet & Spending</span>
            </div>
            <p className="text-[11.5px] leading-relaxed text-[#f1f1ea]">
              {insights.categoryBreakdown?.dietLifestyle || "Analysis calculating..."}
            </p>
          </div>

        </div>

      </section>

      {/* 4. Action Road Planner & Pledge Board */}
      <section className="space-y-6">
        <div className="flex items-center justify-between border-b border-brand-green-100 pb-3">
          <div>
            <h3 className="font-bold text-2xl text-slate-800 serif flex items-center gap-2">
              <Compass className="h-5 w-5 text-brand-green-600" />
              <span>Decarbonization Action Roadmap</span>
            </h3>
            <p className="text-xs text-slate-500">Add high-impact customized activities to your active track list</p>
          </div>
          <span className="bg-[#f5f5f0] text-brand-green-600 text-[10px] px-3 py-1 rounded-full font-bold border border-brand-green-100 uppercase tracking-widest">
            Interactive Pledge Engine
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {insights.actionPlan?.map((action, idx) => {
            const hasPledged = isPledged(action.title);
            return (
              <div 
                key={idx}
                className="bg-white border border-brand-green-100 hover:border-brand-green-200 rounded-[32px] p-6 flex flex-col justify-between shadow-xs transition-all relative overflow-hidden"
              >
                
                {/* Category Indicator Accent Line */}
                <div 
                  className="absolute top-0 left-0 right-0 h-1.5"
                  style={{ 
                    backgroundColor: 
                      action.category === 'transport' ? CATEGORY_COLORS.transport :
                      action.category === 'homeEnergy' ? CATEGORY_COLORS.homeEnergy :
                      action.category === 'diet' ? CATEGORY_COLORS.dietLifestyle :
                      '#c6c6b4' // default slate
                  }}
                />

                <div className="space-y-2 pt-1.5">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-sm uppercase tracking-wide bg-slate-100 text-slate-600">
                      {action.category}
                    </span>
                    <span className={`text-[10px] font-semibold ${
                      action.difficulty === 'Easy' ? 'text-brand-green-600' :
                      action.difficulty === 'Medium' ? 'text-amber-700' : 'text-[#a44d36]'
                    }`}>
                      Difficulty: {action.difficulty}
                    </span>
                  </div>

                  <h4 className="font-extrabold text-slate-800 text-sm sm:text-base leading-tight serif">
                    {action.title}
                  </h4>
                  <p className="text-xs leading-relaxed text-slate-500 font-normal">
                    {action.description}
                  </p>
                </div>

                <div className="flex items-center justify-between mt-5 pt-3 border-t border-slate-100">
                  <div className="space-y-0.5">
                    <span className="text-[10px] text-slate-400 block">Est. Annual Saving</span>
                    <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                      🌱 -{action.impactKg} kg CO₂e
                    </span>
                  </div>

                  <button
                    id={`btn-pledge-${idx}`}
                    onClick={() => {
                      if (!hasPledged) {
                        onAddPledge({
                          actionTitle: action.title,
                          category: action.category,
                          impactKg: action.impactKg
                        });
                      }
                    }}
                    disabled={hasPledged}
                    className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                      hasPledged 
                        ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                        : 'bg-brand-green-50 text-brand-green-700 hover:bg-brand-green-100 border border-brand-green-200'
                    }`}
                    aria-label={hasPledged ? `Pledged action: ${action.title}` : `Pledge to commit to action: ${action.title}`}
                  >
                    {hasPledged ? (
                      <>
                        <CheckCircle className="h-3.5 w-3.5 text-brand-green-600" />
                        <span>Pledged</span>
                      </>
                    ) : (
                      <>
                        <span>Pledge Action</span>
                        <ArrowRight className="h-3.5 w-3.5" />
                      </>
                    )}
                  </button>
                </div>

              </div>
            );
          })}
        </div>
      </section>

    </div>
  );
}
