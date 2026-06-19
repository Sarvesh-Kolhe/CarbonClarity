import React, { useState, useEffect } from 'react';
import Header from './components/Header.tsx';
import CarbonCalculatorForm from './components/CarbonCalculatorForm.tsx';
import DashboardResults from './components/DashboardResults.tsx';
import PledgesTracker from './components/PledgesTracker.tsx';
import HistoryLogView from './components/HistoryLogView.tsx';
import { CarbonFootprintInputs, EmissionBreakdown, AIInsightsResponse, FootprintHistoryLog, CarbonPledge } from './types.ts';
import { calculateCarbonEmissions, GLOBAL_BENCHMARKS } from './carbonUtils.ts';
import { RefreshCw, Leaf, Sparkles, Smile, ShieldCheck, Globe } from 'lucide-react';

const LOCAL_STORAGE_LOGS_KEY = 'carbon_platform_history_logs_v1';
const LOCAL_STORAGE_PLEDGES_KEY = 'carbon_platform_pledges_v1';
const LOCAL_STORAGE_INPUTS_KEY = 'carbon_platform_last_inputs_v1';

const ROTATING_CLIMATE_FACTS = [
  "The international average personal carbon footprint is around 4.7 tonnes of CO₂e per year.",
  "To limit global warming to 1.5°C, the global sustainable target is to average under 2.0 tonnes per person by 2030.",
  "Transitioning to local plant-based meals twice a week is estimated to trim your culinary emissions by up to 350 kg CO₂e annually.",
  "Domestic and short-haul flight segments under 3 hours emit up to 150 kg CO₂e per seat on average, owing to fuel-intensive ascent phases.",
  "Residential electricity grids are gradually transitioning, with regional LED bulb arrays and smart thermostats saving 20% on heating loads."
];

export default function App() {
  const [activeTab, setActiveTab] = useState<'calculate' | 'results' | 'pledges' | 'history'>('calculate');
  const [hasCalculated, setHasCalculated] = useState<boolean>(false);
  const [inputs, setInputs] = useState<CarbonFootprintInputs>({
    transport: { petrolCar: 8000, dieselCar: 0, electricVehicle: 0, bus: 500, trainMetro: 1200, shortHaulFlights: 2, longHaulFlights: 0 },
    homeEnergy: { electricity: 3200, naturalGas: 10000, householdSize: 2 },
    dietLifestyle: { dietType: 'meat-moderate', consumptionLevel: 'medium' }
  });
  const [breakdown, setBreakdown] = useState<EmissionBreakdown>({
    transport: 0,
    homeEnergy: 0,
    dietLifestyle: 0,
    total: 0
  });
  const [insights, setInsights] = useState<AIInsightsResponse>({
    totalAnalysis: "",
    categoryBreakdown: { transport: "", homeEnergy: "", dietLifestyle: "" },
    actionPlan: [],
    comparisons: []
  });
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [historyLogs, setHistoryLogs] = useState<FootprintHistoryLog[]>([]);
  const [pledges, setPledges] = useState<CarbonPledge[]>([]);
  const [factIndex, setFactIndex] = useState<number>(0);
  const [errorStatus, setErrorStatus] = useState<string | null>(null);

  // 1. Initial configuration loading from localStorage
  useEffect(() => {
    try {
      let restoredLogs: FootprintHistoryLog[] = [];
      const storedLogs = localStorage.getItem(LOCAL_STORAGE_LOGS_KEY);
      if (storedLogs) {
        restoredLogs = JSON.parse(storedLogs);
        setHistoryLogs(restoredLogs);
      }

      const storedPledges = localStorage.getItem(LOCAL_STORAGE_PLEDGES_KEY);
      if (storedPledges) setPledges(JSON.parse(storedPledges));

      const storedInputs = localStorage.getItem(LOCAL_STORAGE_INPUTS_KEY);
      if (storedInputs) {
        const parsedInputs = JSON.parse(storedInputs);
        setInputs(parsedInputs);
        const initialCalculation = calculateCarbonEmissions(parsedInputs);
        setBreakdown(initialCalculation);
        setHasCalculated(true);

        // If there are recorded logs and the latest log has saved insights, restore them so the dashboard is complete
        if (restoredLogs.length > 0 && restoredLogs[0].insights) {
          setInsights(restoredLogs[0].insights);
        }
      }
    } catch (e) {
      console.error("Failed to parse cached logs or pledges on startup:", e);
    }
  }, []);

  // Sync state helpers
  const saveLogs = (updatedLogs: FootprintHistoryLog[]) => {
    setHistoryLogs(updatedLogs);
    localStorage.setItem(LOCAL_STORAGE_LOGS_KEY, JSON.stringify(updatedLogs));
  };

  const savePledges = (updatedPledges: CarbonPledge[]) => {
    setPledges(updatedPledges);
    localStorage.setItem(LOCAL_STORAGE_PLEDGES_KEY, JSON.stringify(updatedPledges));
  };

  // Rotating facts during processing
  useEffect(() => {
    let interval: any;
    if (isLoading) {
      interval = setInterval(() => {
        setFactIndex(prev => (prev + 1) % ROTATING_CLIMATE_FACTS.length);
      }, 5500);
    }
    return () => clearInterval(interval);
  }, [isLoading]);

  // Main submission triggers deterministic and Gemini API flow
  const handleCalculate = async (customInputs: CarbonFootprintInputs) => {
    setIsLoading(true);
    setErrorStatus(null);
    setFactIndex(0);

    // 1. Calculate deterministic equations immediately for UI responsive updates
    const initialBreakdown = calculateCarbonEmissions(customInputs);
    setInputs(customInputs);
    setBreakdown(initialBreakdown);
    setHasCalculated(true);
    localStorage.setItem(LOCAL_STORAGE_INPUTS_KEY, JSON.stringify(customInputs));

    // Shift to results immediately so user sees their results while AI load spins! Excellent responsive UI!
    setActiveTab('results');

    try {
      const response = await fetch('/api/insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(customInputs),
      });

      if (!response.ok) {
        throw new Error(`Cloud services returned status: ${response.status}`);
      }

      const parsedInsights: AIInsightsResponse = await response.json();
      setInsights(parsedInsights);

      // Append calculation record to logs ledger
      const newLogitem: FootprintHistoryLog = {
        id: 'log_' + Date.now(),
        date: new Date().toISOString(),
        inputs: customInputs,
        breakdown: initialBreakdown,
        insights: parsedInsights
      };
      
      const updatedLogs = [newLogitem, ...historyLogs];
      saveLogs(updatedLogs);

    } catch (err: any) {
      console.error("Failed to retrieve personalized Gemini analysis:", err);
      setErrorStatus("A minor network latency restricted retrieving real-time Gemini AI actions. An automated science-backed local layout and template were loaded for you!");
      
      // Auto hydrate deterministic template for fallback
      const currentTonnes = initialBreakdown.total / 1000;
      const fallbackAnalysis: AIInsightsResponse = {
        totalAnalysis: `Calculated carbon footprint is ${currentTonnes.toFixed(1)} tonnes CO₂e per year. Target adjustments like active transit, food swaps, and LED systems reduce your yearly footprint dynamically.`,
        categoryBreakdown: {
          transport: `Transport emissions contribute ${initialBreakdown.transport} kg CO₂e. Substituting solo commuting with active walks and rail travel prunes significant fuel burdens.`,
          homeEnergy: `Household utilities reflect ${initialBreakdown.homeEnergy} kg CO₂e. Split evenly across household size.`,
          dietLifestyle: `Diet profile and shopping choices account for ${initialBreakdown.dietLifestyle} kg CO₂e. Adjusting nutritional proteins and tech upgrades is key.`,
        },
        actionPlan: [
          {
            title: "Replace Beef/ Pork meals with Plant-Based Beans",
            description: "Substituting intensive proteins with lentils or beans for 2-3 dinners each week actively limits agricultural soil exhaustion.",
            category: "diet",
            difficulty: "Easy",
            impactKg: 350
          },
          {
            title: "Shift Short Travel Loops to Walking or Cycling",
            description: "Avoid cranking cold engines for grocery pickup runs under 3km. Walk, roll, or bike to preserve petroleum fuels directly.",
            category: "transport",
            difficulty: "Medium",
            impactKg: 280
          },
          {
            title: "Transition Utility Lighting to LED Nodes",
            description: "Replace high-drain filament bulbs and deploy a responsive schedule on heating networks.",
            category: "homeEnergy",
            difficulty: "Easy",
            impactKg: 190
          }
        ],
        comparisons: [
          { label: "Your Footprint", value: parseFloat(currentTonnes.toFixed(2)) },
          { label: "World Average", value: 4.7 },
          { label: "UK Average", value: 6.5 },
          { label: "US Average", value: 16.0 },
          { label: "Sustainable Target", value: 2.0 }
        ]
      };
      setInsights(fallbackAnalysis);

      const newLogitem: FootprintHistoryLog = {
        id: 'log_' + Date.now(),
        date: new Date().toISOString(),
        inputs: customInputs,
        breakdown: initialBreakdown,
        insights: fallbackAnalysis
      };
      const updatedLogs = [newLogitem, ...historyLogs];
      saveLogs(updatedLogs);
    } finally {
      setIsLoading(false);
    }
  };

  // Restoration triggers setting the calculator form values again for iteration
  const handleRestoreInputs = (log: FootprintHistoryLog) => {
    setInputs(log.inputs);
    setBreakdown(log.breakdown);
    if (log.insights) {
      setInsights(log.insights);
    }
    setHasCalculated(true);
    setActiveTab('calculate');
  };

  // Delete individual timeline log
  const handleDeleteLog = (id: string) => {
    const nextLogs = historyLogs.filter(log => log.id !== id);
    saveLogs(nextLogs);
  };

  // Pledge addition from dashboard
  const handleAddPledge = (pledgeBlueprint: Omit<CarbonPledge, 'id' | 'datePledged' | 'status'>) => {
    const newPledge: CarbonPledge = {
      ...pledgeBlueprint,
      id: 'pledge_' + Date.now() + Math.random().toString(36).substr(2, 4),
      datePledged: new Date().toISOString(),
      status: 'pledged'
    };
    const nextPledges = [newPledge, ...pledges];
    savePledges(nextPledges);
  };

  // Toggle completed status checkboxes
  const handleTogglePledgeStatus = (id: string) => {
    const updated = pledges.map(p => {
      if (p.id === id) {
        return { ...p, status: p.status === 'pledged' ? 'completed' as const : 'pledged' as const };
      }
      return p;
    });
    savePledges(updated);
  };

  // Remove individual pledge from ledger
  const handleRemovePledge = (id: string) => {
    const updated = pledges.filter(p => p.id !== id);
    savePledges(updated);
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col font-sans text-slate-800">
      
      {/* Universal header navigation */}
      <Header 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        hasCalculated={hasCalculated} 
        onWarning={setErrorStatus}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Soft Toast Notifications */}
        {errorStatus && (
          <div className="mb-6 bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3">
            <span className="text-amber-500">🛡️</span>
            <div>
              <p className="text-xs font-semibold text-amber-800">{errorStatus}</p>
            </div>
            <button onClick={() => setErrorStatus(null)} className="ml-auto text-xs font-bold text-amber-600 hover:text-amber-800 cursor-pointer">✕</button>
          </div>
        )}

        {/* Global Loading screen when calculating is triggered */}
        {isLoading && activeTab === 'results' && (
          <div className="bg-white border border-slate-150 rounded-3xl p-8 sm:p-12 text-center max-w-2xl mx-auto space-y-6 shadow-xs animate-pulse">
            <div className="mx-auto bg-brand-green-50 p-4 rounded-full w-fit">
              <RefreshCw className="h-8 w-8 text-brand-green-600 animate-spin" />
            </div>
            
            <div className="space-y-2">
              <h3 className="font-extrabold text-xl font-display text-slate-900">Consulting Environmental AI Model...</h3>
              <p className="text-xs text-slate-500 font-medium">Formulating highly targeted greenhouse mitigation paths tailored to your travel, heating, and diet profiles.</p>
            </div>

            <div className="bg-slate-900 text-white rounded-2xl p-4 sm:p-6 text-left border border-slate-800 relative overflow-hidden">
              <div className="flex items-center space-x-2 border-b border-slate-800 pb-2 mb-2">
                <Leaf className="h-4 w-4 text-emerald-400" />
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Did you know?</span>
              </div>
              <p className="text-xs font-medium leading-relaxed italic text-slate-100">
                "{ROTATING_CLIMATE_FACTS[factIndex]}"
              </p>
            </div>
          </div>
        )}

        {/* --- VIEW ROUTER LOGIC --- */}
        {!isLoading && (
          <>
            {activeTab === 'calculate' && (
              <CarbonCalculatorForm 
                onCalculate={handleCalculate} 
                isLoading={isLoading} 
                initialInputs={inputs} 
              />
            )}

            {activeTab === 'results' && hasCalculated && (
              <DashboardResults 
                inputs={inputs} 
                breakdown={breakdown} 
                insights={insights} 
                isLoading={isLoading} 
                onAddPledge={handleAddPledge}
                activePledges={pledges}
              />
            )}

            {activeTab === 'pledges' && (
              <PledgesTracker 
                pledges={pledges} 
                onTogglePledgeStatus={handleTogglePledgeStatus} 
                onRemovePledge={handleRemovePledge} 
                onGoToDashboard={() => setActiveTab('calculate')}
              />
            )}

            {activeTab === 'history' && (
              <HistoryLogView 
                logs={historyLogs} 
                onDeleteLog={handleDeleteLog} 
                onRestoreInputs={handleRestoreInputs} 
              />
            )}
          </>
        )}

      </main>

      {/* Footer Branding segment */}
      <footer className="bg-white border-t border-slate-200 py-6 text-slate-400 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-2 font-normal">
          <p className="flex items-center justify-center gap-1.5 font-medium text-slate-600">
            <Globe className="h-4 w-4 text-brand-green-600" />
            <span>CarbonClarity • Powered by Gemini Flash Guidance</span>
          </p>
          <p className="text-[11px] text-slate-400">
            © 2026 CarbonClarity. Calculated using verified, public greenhouse gas warming potentials (DEFRA, EPA). This tool collects anonymous metadata stored only on your browser.
          </p>
        </div>
      </footer>

    </div>
  );
}
