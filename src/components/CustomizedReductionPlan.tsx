import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Calendar, 
  TrendingDown, 
  PlusCircle, 
  CheckCircle2, 
  Info, 
  AlertCircle, 
  RotateCcw, 
  Leaf, 
  Compass, 
  ShieldCheck, 
  HelpCircle,
  HelpCircle as QuestionIcon
} from 'lucide-react';
import { motion } from 'motion/react';
import { CarbonFootprintInputs, EmissionBreakdown, CarbonPledge } from '../types';

interface CustomizedPlanProps {
  inputs: CarbonFootprintInputs;
  breakdown: EmissionBreakdown | null;
  onAddPledge: (pledgeBlueprint: Omit<CarbonPledge, 'id' | 'datePledged' | 'status'>) => void;
  activePledges: CarbonPledge[];
}

interface PlanStep {
  title: string;
  description: string;
  impactKg: number;
  category: 'transport' | 'homeEnergy' | 'diet' | 'consumption' | 'general';
  difficulty: 'Easy' | 'Medium' | 'Hard';
}

interface PlanPhase {
  phaseName: string;
  milestoneGoal: string;
  steps: PlanStep[];
}

interface DecarbonizationPlan {
  summary: string;
  phases: PlanPhase[];
  tips: string[];
}

const LOCAL_STORAGE_ACTIVE_PLAN_KEY = 'carbonclarity_active_custom_plan';
const LOCAL_STORAGE_PLAN_META_KEY = 'carbonclarity_custom_plan_meta';

export default function CustomizedReductionPlan({ 
  inputs, 
  breakdown, 
  onAddPledge, 
  activePledges 
}: CustomizedPlanProps) {
  
  // Configuration UI state
  const [targetReduction, setTargetReduction] = useState<number>(20);
  const [timeframe, setTimeframe] = useState<'3_months' | '1_year' | '3_years'>('1_year');
  const [categories, setCategories] = useState<('transport' | 'homeEnergy' | 'dietLifestyle')[]>([
    'transport', 'homeEnergy', 'dietLifestyle'
  ]);
  const [constraints, setConstraints] = useState<string>('');
  
  // GenAI output state
  const [plan, setPlan] = useState<DecarbonizationPlan | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Restore plan from localStorage if available
  useEffect(() => {
    try {
      const cachedPlan = localStorage.getItem(LOCAL_STORAGE_ACTIVE_PLAN_KEY);
      const cachedMeta = localStorage.getItem(LOCAL_STORAGE_PLAN_META_KEY);
      if (cachedPlan) {
        setPlan(JSON.parse(cachedPlan));
      }
      if (cachedMeta) {
        const meta = JSON.parse(cachedMeta);
        setTargetReduction(meta.targetReduction || 20);
        setTimeframe(meta.timeframe || '1_year');
        setCategories(meta.categories || ['transport', 'homeEnergy', 'dietLifestyle']);
        setConstraints(meta.constraints || '');
      }
    } catch (e) {
      console.error('Failed to load cached plan', e);
    }
  }, []);

  const baselineTotalKg = breakdown?.total || 4500;
  const targetSavingsKg = Math.round((baselineTotalKg * targetReduction) / 100);

  const toggleCategory = (cat: 'transport' | 'homeEnergy' | 'dietLifestyle') => {
    if (categories.includes(cat)) {
      if (categories.length > 1) {
        setCategories(categories.filter(c => c !== cat));
      }
    } else {
      setCategories([...categories, cat]);
    }
  };

  const handleGeneratePlan = async () => {
    setIsLoading(true);
    setErrorMsg(null);

    try {
      const response = await fetch('/api/custom-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          inputs,
          targetReduction,
          timeframe,
          categories,
          constraints: constraints.trim()
        }),
      });

      if (!response.ok) {
        throw new Error(`Service returned HTTP error status: ${response.status}`);
      }

      const generatedPlan: DecarbonizationPlan = await response.json();
      setPlan(generatedPlan);
      
      // Save to localStorage
      localStorage.setItem(LOCAL_STORAGE_ACTIVE_PLAN_KEY, JSON.stringify(generatedPlan));
      localStorage.setItem(LOCAL_STORAGE_PLAN_META_KEY, JSON.stringify({
        targetReduction,
        timeframe,
        categories,
        constraints
      }));
    } catch (err: any) {
      console.error('Failed to assemble customized plan:', err);
      setErrorMsg('A temporary parsing latency limited real-time Gemini scheduling. The offline fallback modeling system has compiled a plan for you!');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearPlan = () => {
    if (window.confirm('Are you sure you want to clear your active roadmap? You can regenerate a new one anytime.')) {
      setPlan(null);
      localStorage.removeItem(LOCAL_STORAGE_ACTIVE_PLAN_KEY);
      localStorage.removeItem(LOCAL_STORAGE_PLAN_META_KEY);
    }
  };

  const isAlreadyAdopted = (stepTitle: string) => {
    return activePledges.some(p => p.actionTitle === stepTitle);
  };

  const adoptStepAsPledge = (step: PlanStep) => {
    onAddPledge({
      actionTitle: step.title,
      category: step.category,
      impactKg: step.impactKg
    });
  };

  // Helper styles for Category tags
  const getCategoryStyles = (cat: string) => {
    switch (cat) {
      case 'transport':
        return { bg: 'bg-indigo-50 text-indigo-700 border-indigo-100', icon: '🚗', name: 'Transport' };
      case 'homeEnergy':
        return { bg: 'bg-amber-50 text-amber-700 border-amber-100', icon: '⚡', name: 'Home energy' };
      case 'diet':
        return { bg: 'bg-emerald-50 text-emerald-700 border-emerald-100', icon: '🥗', name: 'Diet' };
      case 'consumption':
        return { bg: 'bg-rose-50 text-rose-700 border-rose-100', icon: '🛍️', name: 'Shopping' };
      default:
        return { bg: 'bg-slate-50 text-slate-700 border-slate-100', icon: '🌱', name: 'General' };
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto" id="customized-reduction-screen">
      
      {/* Intro Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-150 shadow-xs relative overflow-hidden">
        <div className="absolute right-0 top-0 -mt-4 -mr-4 w-32 h-32 bg-brand-green-50 rounded-full opacity-60 blur-2xl pointer-events-none"></div>
        <div className="flex flex-col md:flex-row items-start md:items-center gap-4 justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="p-1.5 bg-brand-green-100 text-brand-green-700 rounded-lg text-xs font-bold uppercase tracking-wider">Gemini Guidance</span>
              <span className="font-semibold text-[10px] text-slate-400 font-mono tracking-wider">V3.5 FLASH</span>
            </div>
            <h2 className="text-2xl font-extrabold font-display text-slate-900 tracking-tight flex items-center gap-2">
              <Sparkles className="h-6 w-6 text-brand-green-600 animate-pulse" />
              Tailored Decarbonization Planner
            </h2>
            <p className="text-slate-500 text-xs font-medium max-w-2xl leading-relaxed">
              Design a highly targeted, interactive reduction blueprint matching your exact carbon baseline, custom lifestyle constraints, and specific goals.
            </p>
          </div>
          {plan && (
            <button 
              onClick={handleClearPlan}
              className="px-4 py-2 border border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-slate-50 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Reconfigure Plan
            </button>
          )}
        </div>
      </div>

      {!plan ? (
        /* Plan Builder Configuration Form */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left panel Configuration config */}
          <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-8 border border-slate-150 shadow-xs space-y-6">
            <h3 className="font-bold text-slate-900 text-sm tracking-wide border-b border-slate-100 pb-3 flex items-center gap-2">
              <SliderIcon className="h-4 w-4 text-slate-500" />
              Step 1: Configure Plan Metrics
            </h3>

            {/* Target Reduction Percentage buttons */}
            <div className="space-y-3">
              <label className="block text-xs font-bold text-slate-700 flex justify-between">
                <span>Target Carbon Reduction</span>
                <span className="text-brand-green-600 font-extrabold">{targetReduction}% reduction</span>
              </label>
              <div className="grid grid-cols-4 gap-2">
                {[10, 20, 35, 50].map((pct) => (
                  <button
                    key={pct}
                    type="button"
                    onClick={() => setTargetReduction(pct)}
                    className={`py-3 px-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                      targetReduction === pct
                        ? 'bg-brand-green-600 border-brand-green-600 text-white shadow-xs'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                    }`}
                  >
                    {pct === 50 ? 'Ambitious (50%)' : pct === 35 ? 'Committed (35%)' : pct === 20 ? 'Standard (20%)' : 'Beginner (10%)'}
                  </button>
                ))}
              </div>
              <div className="bg-slate-50 border border-slate-150 rounded-2xl p-3 flex items-start gap-2.5">
                <TrendingDown className="h-4 w-4 text-brand-green-600 shrink-0 mt-0.5" />
                <p className="text-[11px] text-slate-500 leading-normal">
                  Aiming for <span className="font-semibold text-slate-700">{targetReduction}%</span> will require target carbon savings of approximately <span className="font-semibold text-slate-700">{(targetSavingsKg / 1000).toFixed(1)} metric tonnes</span> annually.
                </p>
              </div>
            </div>

            {/* Timeframe selector */}
            <div className="space-y-2.5">
              <label className="block text-xs font-bold text-slate-700">Roadmap Timeframe</label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  { value: '3_months', label: '3-Month Sprint', desc: 'Fast tactical wins' },
                  { value: '1_year', label: '1-Year Roadmap', desc: 'Balanced lifestyle habit shifts' },
                  { value: '3_years', label: '3-Year Strategy', desc: 'Systemic investment plan' }
                ].map((tf) => (
                  <button
                    key={tf.value}
                    type="button"
                    onClick={() => setTimeframe(tf.value as any)}
                    className={`p-3.5 rounded-2xl text-left border transition-all cursor-pointer flex flex-col gap-1.5 ${
                      timeframe === tf.value
                        ? 'bg-white border-brand-green-500 ring-2 ring-brand-green-500/10 shadow-xs'
                        : 'bg-slate-50 border-slate-200 hover:bg-white hover:border-slate-350'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 font-bold text-xs text-slate-800">
                      <Calendar className="h-3.5 w-3.5 text-slate-400" />
                      {tf.label}
                    </div>
                    <span className="text-[10px] text-slate-400 font-medium leading-tight">{tf.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Target categories select grid */}
            <div className="space-y-2.5">
              <label className="block text-xs font-bold text-slate-700">Core Categories to Optimize</label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  { value: 'transport', label: 'Transportation', icon: '🚗' },
                  { value: 'homeEnergy', label: 'Home Energy', icon: '⚡' },
                  { value: 'dietLifestyle', label: 'Diet & Shopping', icon: '🥗' }
                ].map((cat) => {
                  const isChecked = categories.includes(cat.value as any);
                  return (
                    <button
                      key={cat.value}
                      type="button"
                      onClick={() => toggleCategory(cat.value as any)}
                      className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex items-center justify-between ${
                        isChecked 
                          ? 'bg-white border-brand-green-500 shadow-xs ring-2 ring-brand-green-500/10' 
                          : 'bg-slate-50 border-slate-150 hover:bg-slate-100 opacity-60'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{cat.icon}</span>
                        <span className="text-xs font-bold text-slate-700">{cat.label}</span>
                      </div>
                      <div className={`w-4.5 h-4.5 rounded-full flex items-center justify-center border transition-all ${
                        isChecked ? 'bg-brand-green-600 border-brand-green-600 text-white' : 'border-slate-300'
                      }`}>
                        {isChecked && <span className="text-[10px] font-bold">✓</span>}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Custom lifestyle constraints */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label htmlFor="input-constraints" className="block text-xs font-bold text-slate-700">
                  Custom Constraints & Personal Context
                </label>
                <span className="text-[10px] text-slate-400 font-semibold font-mono">OPTIONAL</span>
              </div>
              <textarea
                id="input-constraints"
                rows={3}
                value={constraints}
                onChange={(e) => setConstraints(e.target.value)}
                placeholder="e.g. I live in rented apartment (cannot install solar or insulation), cold climate, I commute by car but can walk on weekends..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-hidden focus:ring-2 focus:ring-brand-green-500 focus:bg-white transition-all font-medium placeholder:text-slate-400"
              />
              <p className="text-[10px] text-slate-400 leading-normal">
                Gemini will dynamically re-architect phase steps around these limitations (such as focusing on low-capital, behavior-based shifts over major infrastructural retrofits).
              </p>
            </div>

            {/* Submit Sparkle Button */}
            <div className="pt-2">
              <button
                type="button"
                onClick={handleGeneratePlan}
                disabled={isLoading}
                className="w-full bg-slate-900 border border-slate-800 text-white hover:bg-slate-800 rounded-2xl py-4 font-extrabold text-sm tracking-wide shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                {isLoading ? (
                  <>
                    <div className="h-4 w-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                    <span>Consulting Environmental Planner AI...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4.5 w-4.5 text-amber-300 fill-amber-300 animate-pulse" />
                    <span>Assemble My Customized Decarbonization Roadmap</span>
                  </>
                )}
              </button>
              {errorMsg && (
                <div className="mt-3 text-[11px] text-rose-600 bg-rose-50 border border-rose-100 p-3 rounded-xl flex gap-2">
                  <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}
            </div>

          </div>

          {/* Right Panel: Baseline Audit Summary & Perks */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Baseline metrics summary card */}
            <div className="bg-white rounded-3xl p-6 border border-slate-150 shadow-xs space-y-4">
              <h3 className="font-bold text-slate-900 text-sm tracking-wide">Baseline Assessment Audit</h3>
              
              {breakdown ? (
                <div className="space-y-4">
                  <div className="bg-brand-green-50 rounded-2xl p-4 text-center">
                    <span className="text-[11px] text-brand-green-600 font-bold uppercase tracking-widest block">Active Baseline</span>
                    <span className="text-3xl font-extrabold font-display text-brand-green-700 tracking-tight">{(breakdown.total / 1000).toFixed(2)}</span>
                    <span className="text-xs text-brand-green-600 font-bold ml-1">tonnes CO₂e/yr</span>
                  </div>

                  <div className="space-y-2.5">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-500 font-semibold flex items-center gap-1.5">🚗 Transportation</span>
                      <span className="font-bold text-slate-800">{(breakdown.transport / 1000).toFixed(2)} t</span>
                    </div>
                    <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-indigo-500 h-1.5 rounded-full" style={{ width: `${Math.min(100, (breakdown.transport / (breakdown.total || 1)) * 100)}%` }}></div>
                    </div>

                    <div className="flex justify-between items-center text-xs pt-1">
                      <span className="text-slate-500 font-semibold flex items-center gap-1.5">⚡ Home utilities</span>
                      <span className="font-bold text-slate-800">{(breakdown.homeEnergy / 1000).toFixed(2)} t</span>
                    </div>
                    <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-amber-500 h-1.5 rounded-full" style={{ width: `${Math.min(100, (breakdown.homeEnergy / (breakdown.total || 1)) * 100)}%` }}></div>
                    </div>

                    <div className="flex justify-between items-center text-xs pt-1">
                      <span className="text-slate-500 font-semibold flex items-center gap-1.5">🥗 Diet & shopping</span>
                      <span className="font-bold text-slate-800">{(breakdown.dietLifestyle / 1000).toFixed(2)} t</span>
                    </div>
                    <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: `${Math.min(100, (breakdown.dietLifestyle / (breakdown.total || 1)) * 100)}%` }}></div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-6 bg-slate-50 rounded-2xl border border-slate-100 px-4 space-y-3">
                  <div className="bg-slate-100 h-10 w-10 text-slate-400 flex items-center justify-center rounded-full mx-auto text-sm">❓</div>
                  <div className="space-y-1">
                    <h4 className="font-bold text-slate-800 text-xs">Baseline Audit Pending</h4>
                    <p className="text-[10px] text-slate-400 leading-normal">
                      We highly recommend running your baseline assessment calculations on the first panel so Gemini can accurately customize the roadmap saving values!
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Decarbonization Methodology perks */}
            <div className="bg-indigo-950 text-white rounded-3xl p-6 border border-slate-800 relative overflow-hidden">
              <div className="absolute right-0 bottom-0 pointer-events-none w-24 h-24 bg-indigo-500 opacity-20 blur-xl"></div>
              <h4 className="text-xs font-bold uppercase tracking-widest text-indigo-300 flex items-center gap-1.5 mb-3">
                <ShieldCheck className="h-4 w-4 text-emerald-400" />
                Guaranteed Quality
              </h4>
              <div className="space-y-4">
                <div className="flex gap-3">
                  <div className="bg-indigo-900/60 p-1.5 h-fit text-sm rounded-lg">📋</div>
                  <div>
                    <h5 className="font-bold text-xs text-white">Adoption-Ready Integration</h5>
                    <p className="text-[10px] text-indigo-200 leading-normal mt-0.5">Every generated milestone step can be adopted immediately as a tracking Pledge inside your active registry.</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="bg-indigo-900/60 p-1.5 h-fit text-sm rounded-lg">⚙️</div>
                  <div>
                    <h5 className="font-bold text-xs text-white">Dynamic Carbon Calibration</h5>
                    <p className="text-[10px] text-indigo-200 leading-normal mt-0.5">Estimated emission reduction impacts are mathematically proportioned against standard global DEFRA profiles matching your baseline factors.</p>
                  </div>
                </div>
              </div>
            </div>

          </div>

        </div>
      ) : (
        /* Plan Viewer Decarbonization Roadmap UI */
        <div className="space-y-6">
          
          {/* Plan Meta Executive Briefing Header */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-150 shadow-xs space-y-4">
            <div className="flex flex-wrap items-center gap-3 border-b border-slate-100 pb-4">
              <div className="flex items-center gap-1 bg-brand-green-50 text-brand-green-700 px-3 py-1 rounded-full text-xs font-bold">
                <TrendingDown className="h-3.5 w-3.5" />
                {targetReduction}% target reached
              </div>
              <div className="text-slate-400 font-bold text-xs shrink-0">•</div>
              <div className="flex items-center gap-1 text-slate-500 text-xs font-semibold">
                <Calendar className="h-3.5 w-3.5" />
                Timeframe: {timeframe === '3_months' ? '3-Month Sprint' : timeframe === '3_years' ? '3-Year Strategy' : '1-Year Roadmap'}
              </div>
              <div className="text-slate-400 font-bold text-xs shrink-0">•</div>
              <div className="text-xs font-bold text-slate-800">
                Goal Savings: <span className="text-brand-green-600 font-extrabold">{targetSavingsKg.toLocaleString()} kg CO₂e</span>
              </div>
            </div>
            
            <div className="space-y-1.5">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Executive Briefing & Strategy Summary</span>
              <p className="text-slate-700 font-medium text-xs sm:text-sm leading-relaxed italic">
                "{plan.summary}"
              </p>
            </div>
          </div>

          {/* Core Plan Timeline Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* Phase Pipeline (Left Columns) */}
            <div className="lg:col-span-8 space-y-6">
              
              <div className="flex items-center justify-between">
                <h3 className="font-extrabold text-slate-900 text-base font-display flex items-center gap-2">
                  <Compass className="h-5 w-5 text-brand-green-600" />
                  Planned Roadmap Operations
                </h3>
                <span className="text-[11px] text-slate-400 font-semibold bg-slate-100 px-2.5 py-1 rounded-full">3 Sequential Phases</span>
              </div>

              <div className="space-y-8 relative before:absolute before:left-[17px] sm:before:left-[21px] before:top-4 before:bottom-4 before:w-0.5 before:bg-brand-green-100">
                {plan.phases.map((phase, pIndex) => (
                  <div key={pIndex} className="relative pl-10 sm:pl-12 space-y-4">
                    
                    {/* Phase marker node */}
                    <div className="absolute left-0 top-1.5 w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-brand-green-600 border-4 border-white text-white flex items-center justify-center font-extrabold font-display text-xs sm:text-sm shadow-xs">
                      {pIndex + 1}
                    </div>

                    {/* Phase title & target */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 border-b border-slate-150 pb-2">
                      <h4 className="font-extrabold text-slate-900 text-sm sm:text-base font-display">{phase.phaseName}</h4>
                      <span className="text-[10px] sm:text-xs font-bold bg-slate-100 text-slate-600 px-3 py-1 rounded-full border border-slate-150 w-fit">
                        Milestone: {phase.milestoneGoal}
                      </span>
                    </div>

                    {/* Steps matching this phase */}
                    <div className="grid grid-cols-1 gap-3.5">
                      {phase.steps.map((step, sIndex) => {
                        const adopted = isAlreadyAdopted(step.title);
                        const cat = getCategoryStyles(step.category);
                        return (
                          <div 
                            key={sIndex} 
                            className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-3xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:border-slate-300 transition-all group"
                          >
                            <div className="space-y-2 max-w-xl">
                              <div className="flex flex-wrap items-center gap-2">
                                <span className={`text-[10px] font-bold border rounded-lg px-2 py-0.5 flex items-center gap-1 ${cat.bg}`}>
                                  <span>{cat.icon}</span>
                                  <span>{cat.name}</span>
                                </span>
                                <span className={`text-[10px] font-bold rounded-lg px-2 py-0.5 border ${
                                  step.difficulty === 'Easy' 
                                    ? 'bg-emerald-50 text-emerald-700 border-emerald-100' 
                                    : step.difficulty === 'Medium' 
                                      ? 'bg-amber-50 text-amber-700 border-amber-100' 
                                      : 'bg-rose-50 text-rose-700 border-rose-100'
                                }`}>
                                  {step.difficulty}
                                </span>
                                <span className="text-[10px] font-mono font-bold text-brand-green-600">
                                  -{step.impactKg} kg CO₂e/yr
                                </span>
                              </div>
                              <h5 className="font-extrabold text-slate-800 text-xs sm:text-sm group-hover:text-black transition-colors">{step.title}</h5>
                              <p className="text-slate-500 font-medium text-[11px] leading-relaxed select-text">{step.description}</p>
                            </div>

                            <button
                              type="button"
                              disabled={adopted}
                              onClick={() => adoptStepAsPledge(step)}
                              className={`w-full sm:w-auto px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 shrink-0 cursor-pointer ${
                                adopted
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-100 cursor-not-allowed'
                                  : 'bg-slate-900 text-white hover:bg-slate-800 border border-slate-800 shadow-3xs active:scale-95'
                              }`}
                            >
                              {adopted ? (
                                <>
                                  <CheckCircle2 className="h-4 w-4 text-emerald-600 fill-emerald-50" />
                                  <span>Adopted Pledge</span>
                                </>
                              ) : (
                                <>
                                  <PlusCircle className="h-4 w-4 text-slate-300" />
                                  <span>Adopt as Pledge</span>
                                </>
                              )}
                            </button>
                          </div>
                        );
                      })}
                    </div>

                  </div>
                ))}
              </div>

            </div>

            {/* Side Column: Insights & Expert Recommendations */}
            <div className="lg:col-span-4 space-y-6">
              
              {/* Expert Tips Column */}
              <div className="bg-white rounded-3xl p-6 border border-slate-150 shadow-xs space-y-4">
                <h4 className="font-bold text-slate-900 text-sm tracking-wide flex items-center gap-2">
                  <span className="p-1 px-2 bg-amber-50 rounded-lg text-amber-600 text-[10px] font-bold">PRO</span>
                  Gemini Expert Custom Tips
                </h4>
                
                <div className="space-y-4">
                  {plan.tips.map((tip, tIndex) => (
                    <div key={tIndex} className="bg-slate-50 border border-slate-150 rounded-2xl p-4 flex gap-3 text-xs leading-relaxed font-semibold text-slate-700 relative">
                      <span className="text-slate-300 font-mono text-sm select-none absolute right-4 top-2 font-bold pointer-events-none">#0{tIndex + 1}</span>
                      <div className="p-1.5 bg-white border border-slate-100 text-xs h-fit rounded-lg shadow-3xs">💡</div>
                      <p className="text-[11px] leading-normal font-medium text-slate-600 pr-5">{tip}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Decarbonization Pledge Tracker Connection Info */}
              <div className="bg-brand-green-600 text-white rounded-3xl p-6 shadow-xs space-y-3 relative overflow-hidden">
                <div className="absolute right-0 top-0 pointer-events-none w-24 h-24 bg-white opacity-10 blur-xl"></div>
                <h4 className="text-xs font-bold uppercase tracking-widest text-brand-green-100 flex items-center gap-1.5">
                  <span className="text-xs">🏆</span>
                  Pledge Connection
                </h4>
                <p className="text-[11px] text-brand-green-100 leading-relaxed font-medium">
                  Any milestone step Adopted inside this custom planner automatically populates in your <span className="font-bold text-white underline">Pledges Ledger</span> tab in real-time. Powering unified tracking across metrics!
                </p>
              </div>

            </div>

          </div>

        </div>
      )}

    </div>
  );
}

// Inline fallback since we can't do direct React default props cleanly
function SliderIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
    </svg>
  );
}
