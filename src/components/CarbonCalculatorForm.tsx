import React, { useState } from 'react';
import { Car, Home, Flame, Utensils, Sparkles, Send, RefreshCw, Milestone } from 'lucide-react';
import { CarbonFootprintInputs, EmissionBreakdown } from '../types.js';
import { calculateCarbonEmissions } from '../carbonUtils.js';

interface CarbonCalculatorFormProps {
  onCalculate: (inputs: CarbonFootprintInputs, response: any | null) => void;
  isLoading: boolean;
  initialInputs?: CarbonFootprintInputs;
}

const DEFAULT_INPUTS: CarbonFootprintInputs = {
  transport: {
    petrolCar: 8000,
    dieselCar: 0,
    electricVehicle: 0,
    bus: 500,
    trainMetro: 1200,
    shortHaulFlights: 2,
    longHaulFlights: 0,
  },
  homeEnergy: {
    electricity: 3200,
    naturalGas: 10000,
    householdSize: 2,
  },
  dietLifestyle: {
    dietType: 'meat-moderate',
    consumptionLevel: 'medium',
  },
};

export default function CarbonCalculatorForm({ onCalculate, isLoading, initialInputs }: CarbonCalculatorFormProps) {
  const [inputs, setInputs] = useState<CarbonFootprintInputs>(initialInputs || DEFAULT_INPUTS);
  const [calculationMode, setCalculationMode] = useState<'realtime' | 'submitted'>('realtime');

  // Real-time calculation feedback
  const realTimeEmission = calculateCarbonEmissions(inputs);

  const handleTransportChange = (field: keyof CarbonFootprintInputs['transport'], val: string) => {
    const num = Math.max(0, parseFloat(val) || 0);
    setInputs(prev => ({
      ...prev,
      transport: { ...prev.transport, [field]: num }
    }));
  };

  const handleHomeEnergyChange = (field: keyof CarbonFootprintInputs['homeEnergy'], val: string) => {
    const num = Math.max(0, parseFloat(val) || 0);
    setInputs(prev => ({
      ...prev,
      homeEnergy: { ...prev.homeEnergy, [field]: num }
    }));
  };

  const handleDietChange = (dietType: CarbonFootprintInputs['dietLifestyle']['dietType']) => {
    setInputs(prev => ({
      ...prev,
      dietLifestyle: { ...prev.dietLifestyle, dietType }
    }));
  };

  const handleConsumptionChange = (consumptionLevel: CarbonFootprintInputs['dietLifestyle']['consumptionLevel']) => {
    setInputs(prev => ({
      ...prev,
      dietLifestyle: { ...prev.dietLifestyle, consumptionLevel }
    }));
  };

  // Quick Presets to aid instant fill
  const applyPreset = (type: 'green' | 'average' | 'high') => {
    if (type === 'green') {
      setInputs({
        transport: { petrolCar: 0, dieselCar: 0, electricVehicle: 3000, bus: 1500, trainMetro: 4200, shortHaulFlights: 0, longHaulFlights: 0 },
        homeEnergy: { electricity: 1800, naturalGas: 3000, householdSize: 3 },
        dietLifestyle: { dietType: 'vegan', consumptionLevel: 'low' }
      });
    } else if (type === 'average') {
      setInputs(DEFAULT_INPUTS);
    } else if (type === 'high') {
      setInputs({
        transport: { petrolCar: 18000, dieselCar: 5000, electricVehicle: 0, bus: 200, trainMetro: 500, shortHaulFlights: 6, longHaulFlights: 3 },
        homeEnergy: { electricity: 6000, naturalGas: 15000, householdSize: 1 },
        dietLifestyle: { dietType: 'meat-heavy', consumptionLevel: 'high' }
      });
    }
  };

  // Form Submission handles triggering the full server-side Gemini analytical call
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    onCalculate(inputs, null); // Hand off state and trigger AI fetching in App
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      
      {/* 1. Main Welcome/Intro Banner matching screenshot closely */}
      <section className="bg-brand-green-600 rounded-[32px] p-6 sm:p-10 text-white shadow-xs relative overflow-hidden">
        {/* Subtle decorative visual elements */}
        <div className="absolute -top-12 -right-12 w-48 h-48 bg-white/5 rounded-full blur-2xl" />
        <div className="absolute -bottom-12 -left-12 w-36 h-36 bg-[#8b8b6b]/10 rounded-full blur-xl" />

        <div className="relative z-10 text-center max-w-3xl mx-auto space-y-4">
          <span className="text-[10px] uppercase tracking-[0.25em] font-bold text-brand-green-100">Lifestyle Assessment</span>
          <h2 className="text-3xl sm:text-[44px] leading-tight serif font-light tracking-tight text-white">
            What's Your <span className="italic font-bold">Carbon Footprint</span>?
          </h2>
          <p className="text-xs sm:text-sm text-brand-green-100 max-w-2xl mx-auto font-normal leading-relaxed">
            Enter your lifestyle parameters below to calculate your annual CO₂e emissions, compare output values to scientific parameters, and retrieve real-time Gemini AI diagnostics or actions.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 text-[11px]">
            <div className="bg-white/5 backdrop-blur-md rounded-2xl p-3 flex items-center space-x-2 border border-white/10">
              <span className="text-xl">📊</span>
              <div className="text-left">
                <span className="block font-semibold">Science-Backed</span>
                <span className="text-[#c6c6b4]">DEFRA emission models</span>
              </div>
            </div>
            <div className="bg-white/5 backdrop-blur-md rounded-2xl p-3 flex items-center space-x-2 border border-white/10">
              <span className="text-xl">✨</span>
              <div className="text-left">
                <span className="block font-semibold">Gemini AI Insights</span>
                <span className="text-[#c6c6b4]">Customized reduction plans</span>
              </div>
            </div>
            <div className="bg-white/5 backdrop-blur-md rounded-2xl p-3 flex items-center space-x-2 border border-white/10">
              <span className="text-xl">🔒</span>
              <div className="text-left">
                <span className="block font-semibold">Anonymous & Private</span>
                <span className="text-[#c6c6b4]">Cached locally on device</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Fill Presets Selector */}
      <div className="bg-white border border-brand-green-100 rounded-[24px] p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Milestone className="h-5 w-5 text-brand-green-600" />
          <div>
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Need a quick starting point?</h4>
            <p className="text-[11px] text-slate-500">Apply a pre-configured template, then customize the figures.</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <button 
            type="button" 
            onClick={() => applyPreset('green')}
            className="px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#f0f0ea] border border-[#d2d2c2] text-brand-green-600 hover:bg-brand-green-100 transition-colors cursor-pointer"
          >
            🌱 Low-Impact
          </button>
          <button 
            type="button" 
            onClick={() => applyPreset('average')}
            className="px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#e5e5dc] border border-[#c6c6b4] text-slate-700 hover:bg-[#d8d8ce] transition-colors cursor-pointer"
          >
            ⚖️ World Avg
          </button>
          <button 
            type="button" 
            onClick={() => applyPreset('high')}
            className="px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-rose-50 border border-rose-200 text-rose-700 hover:bg-rose-100 transition-colors cursor-pointer"
          >
            ✈️ High Intensity
          </button>
        </div>
      </div>
      <form onSubmit={handleSubmit} className="space-y-6">

        {/* --- TRANSPORT CARD SECTION --- */}
        <div className="bg-white rounded-[32px] border border-brand-green-100 p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex items-center gap-3 border-b border-brand-green-50 pb-4">
            <span className="text-3xl">🚗</span>
            <div>
              <h3 className="font-bold text-xl text-slate-800 serif">Transport</h3>
              <p className="text-xs text-slate-500">Your yearly kilometres and flight metrics.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
            {/* Petrol Car */}
            <div className="space-y-1.5">
              <label htmlFor="input-petrolCar" className="block text-xs font-bold text-slate-700">
                Petrol Car <span className="text-slate-400 font-normal">(km/year)</span>
              </label>
              <input
                id="input-petrolCar"
                type="number"
                min="0"
                value={inputs.transport.petrolCar}
                onChange={e => handleTransportChange('petrolCar', e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-hidden focus:ring-2 focus:ring-brand-green-500 focus:bg-white transition-all font-medium"
              />
              <p className="text-[11px] text-slate-400 font-normal">Annual kilometres driven in a petrol or hybrid car</p>
            </div>

            {/* Diesel Car */}
            <div className="space-y-1.5">
              <label htmlFor="input-dieselCar" className="block text-xs font-bold text-slate-700">
                Diesel Car <span className="text-slate-400 font-normal">(km/year)</span>
              </label>
              <input
                id="input-dieselCar"
                type="number"
                min="0"
                value={inputs.transport.dieselCar}
                onChange={e => handleTransportChange('dieselCar', e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-hidden focus:ring-2 focus:ring-brand-green-500 focus:bg-white transition-all font-medium"
              />
              <p className="text-[11px] text-slate-400 font-normal">Annual kilometres driven in a diesel car</p>
            </div>

            {/* Electric Vehicle */}
            <div className="space-y-1.5">
              <label htmlFor="input-electricVehicle" className="block text-xs font-bold text-slate-700">
                Electric Vehicle <span className="text-slate-400 font-normal">(km/year)</span>
              </label>
              <input
                id="input-electricVehicle"
                type="number"
                min="0"
                value={inputs.transport.electricVehicle}
                onChange={e => handleTransportChange('electricVehicle', e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-hidden focus:ring-2 focus:ring-brand-green-500 focus:bg-white transition-all font-medium"
              />
              <p className="text-[11px] text-slate-400 font-normal">Annual kilometres driven in a battery electric car</p>
            </div>

            {/* Bus */}
            <div className="space-y-1.5">
              <label htmlFor="input-bus" className="block text-xs font-bold text-slate-700">
                Bus <span className="text-slate-400 font-normal">(km/year)</span>
              </label>
              <input
                id="input-bus"
                type="number"
                min="0"
                value={inputs.transport.bus}
                onChange={e => handleTransportChange('bus', e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-hidden focus:ring-2 focus:ring-brand-green-500 focus:bg-white transition-all font-medium"
              />
              <p className="text-[11px] text-slate-400 font-normal">Annual kilometres travelled by bus or coach</p>
            </div>

            {/* Train / Metro */}
            <div className="space-y-1.5">
              <label htmlFor="input-train" className="block text-xs font-bold text-slate-700">
                Train / Metro <span className="text-slate-400 font-normal">(km/year)</span>
              </label>
              <input
                id="input-train"
                type="number"
                min="0"
                value={inputs.transport.trainMetro}
                onChange={e => handleTransportChange('trainMetro', e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-hidden focus:ring-2 focus:ring-brand-green-500 focus:bg-white transition-all font-medium"
              />
              <p className="text-[11px] text-slate-400 font-normal">Annual kilometres by train, metro, or tram</p>
            </div>

            {/* Short-haul flights */}
            <div className="space-y-1.5">
              <label htmlFor="input-shortFlights" className="block text-xs font-bold text-slate-700">
                Short-Haul Flights <span className="text-slate-400 font-normal">(flights/year)</span>
              </label>
              <input
                id="input-shortFlights"
                type="number"
                min="0"
                value={inputs.transport.shortHaulFlights}
                onChange={e => handleTransportChange('shortHaulFlights', e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-hidden focus:ring-2 focus:ring-brand-green-500 focus:bg-white transition-all font-medium"
              />
              <p className="text-[11px] text-slate-400 font-normal">Flights under 3 hours (e.g. London to Paris)</p>
            </div>

            {/* Long-haul flights */}
            <div className="space-y-1.5 md:col-span-2">
              <label htmlFor="input-longFlights" className="block text-xs font-bold text-slate-700">
                Long-Haul Flights <span className="text-slate-400 font-normal">(flights/year)</span>
              </label>
              <input
                id="input-longFlights"
                type="number"
                min="0"
                value={inputs.transport.longHaulFlights}
                onChange={e => handleTransportChange('longHaulFlights', e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-hidden focus:ring-2 focus:ring-brand-green-500 focus:bg-white transition-all font-medium"
              />
              <p className="text-[11px] text-slate-400 font-normal">Flights over 3 hours (e.g. London to New York)</p>
            </div>
          </div>
        </div>

        {/* --- HOME ENERGY CARD SECTION --- */}
        <div className="bg-white rounded-[32px] border border-brand-green-100 p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex items-center gap-3 border-b border-brand-green-50 pb-4">
            <span className="text-3xl">🏠</span>
            <div>
              <h3 className="font-bold text-xl text-slate-800 serif">Home Energy</h3>
              <p className="text-xs text-slate-500">Your household's annual energy consumption. Costs are split across members.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
            {/* Electricity */}
            <div className="space-y-1.5">
              <label htmlFor="input-electricity" className="block text-xs font-bold text-slate-700">
                Electricity <span className="text-slate-400 font-normal">(kWh/year)</span>
              </label>
              <input
                id="input-electricity"
                type="number"
                min="0"
                value={inputs.homeEnergy.electricity}
                onChange={e => handleHomeEnergyChange('electricity', e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-hidden focus:ring-2 focus:ring-brand-green-500 focus:bg-white transition-all font-medium"
              />
              <p className="text-[11px] text-slate-400 font-normal">Check your electricity bill bills – UK average is ~3,700 kWh/year</p>
            </div>

            {/* Natural Gas */}
            <div className="space-y-1.5">
              <label htmlFor="input-gas" className="block text-xs font-bold text-slate-700">
                Natural Gas <span className="text-slate-400 font-normal">(kWh/year)</span>
              </label>
              <input
                id="input-gas"
                type="number"
                min="0"
                value={inputs.homeEnergy.naturalGas}
                onChange={e => handleHomeEnergyChange('naturalGas', e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-hidden focus:ring-2 focus:ring-brand-green-500 focus:bg-white transition-all font-medium"
              />
              <p className="text-[11px] text-slate-400 font-normal">UK average is ~12,000 kWh/year for heating and cooking</p>
            </div>

            {/* Household Size */}
            <div className="space-y-1.5 md:col-span-2">
              <label htmlFor="input-householdSize" className="block text-xs font-bold text-slate-700">
                Household Size <span className="text-slate-400 font-normal">(people)</span>
              </label>
              <input
                id="input-householdSize"
                type="number"
                min="1"
                value={inputs.homeEnergy.householdSize}
                onChange={e => handleHomeEnergyChange('householdSize', e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-hidden focus:ring-2 focus:ring-brand-green-500 focus:bg-white transition-all font-medium"
              />
              <p className="text-[11px] text-slate-400 font-normal">Number of people sharing your home (home emissions split equally)</p>
            </div>
          </div>
        </div>

        {/* --- DIET & LIFESTYLE CARD SECTION --- */}
        <div className="bg-white rounded-[32px] border border-brand-green-100 p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex items-center gap-3 border-b border-brand-green-50 pb-4">
            <span className="text-3xl">🥗</span>
            <div>
              <h3 className="font-bold text-xl text-slate-800 serif">Diet & Lifestyle</h3>
              <p className="text-xs text-slate-500">Your dietary pattern and consumption habits dictate essential carbon cycles.</p>
            </div>
          </div>

          <div className="space-y-4">
            <label className="block text-xs font-bold text-slate-700">Diet Type</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              
              {/* Meat Heavy */}
              <label 
                className={`border rounded-2xl p-4 flex items-start gap-3 cursor-pointer transition-all ${
                  inputs.dietLifestyle.dietType === 'meat-heavy'
                    ? 'border-red-500 bg-red-50/10'
                    : 'border-slate-200 bg-slate-50/50 hover:bg-slate-50'
                }`}
              >
                <input
                  id="diet-meat-heavy"
                  type="radio"
                  name="dietType"
                  checked={inputs.dietLifestyle.dietType === 'meat-heavy'}
                  onChange={() => handleDietChange('meat-heavy')}
                  className="mt-1 accent-red-500"
                />
                <div>
                  <span className="block text-sm font-semibold text-slate-900">🥩 Meat-heavy</span>
                  <span className="block text-xs text-slate-500 font-normal mt-0.5">Meat with most meals (&gt;100g/day)</span>
                </div>
              </label>

              {/* Meat Moderate */}
              <label 
                className={`border rounded-2xl p-4 flex items-start gap-3 cursor-pointer transition-all ${
                  inputs.dietLifestyle.dietType === 'meat-moderate'
                    ? 'border-brand-green-500 bg-brand-green-50/20'
                    : 'border-slate-200 bg-slate-50/50 hover:bg-slate-50'
                }`}
              >
                <input
                  id="diet-meat-moderate"
                  type="radio"
                  name="dietType"
                  checked={inputs.dietLifestyle.dietType === 'meat-moderate'}
                  onChange={() => handleDietChange('meat-moderate')}
                  className="mt-1 accent-brand-green-500"
                />
                <div>
                  <span className="block text-sm font-semibold text-slate-900">🍗 Meat-moderate</span>
                  <span className="block text-xs text-slate-500 font-normal mt-0.5">Meat a few times a week, regular portions</span>
                </div>
              </label>

              {/* Vegetarian */}
              <label 
                className={`border rounded-2xl p-4 flex items-start gap-3 cursor-pointer transition-all ${
                  inputs.dietLifestyle.dietType === 'vegetarian'
                    ? 'border-brand-green-500 bg-brand-green-50/20'
                    : 'border-slate-200 bg-slate-50/50 hover:bg-slate-50'
                }`}
              >
                <input
                  id="diet-vegetarian"
                  type="radio"
                  name="dietType"
                  checked={inputs.dietLifestyle.dietType === 'vegetarian'}
                  onChange={() => handleDietChange('vegetarian')}
                  className="mt-1 accent-brand-green-500"
                />
                <div>
                  <span className="block text-sm font-semibold text-slate-900">🥚 Vegetarian</span>
                  <span className="block text-xs text-slate-500 font-normal mt-0.5">No meat, but dairy, plant-proteins & eggs are okay</span>
                </div>
              </label>

              {/* Vegan */}
              <label 
                className={`border rounded-2xl p-4 flex items-start gap-3 cursor-pointer transition-all ${
                  inputs.dietLifestyle.dietType === 'vegan'
                    ? 'border-brand-green-600 bg-emerald-50/35'
                    : 'border-slate-200 bg-slate-50/50 hover:bg-slate-50'
                }`}
              >
                <input
                  id="diet-vegan"
                  type="radio"
                  name="dietType"
                  checked={inputs.dietLifestyle.dietType === 'vegan'}
                  onChange={() => handleDietChange('vegan')}
                  className="mt-1 accent-brand-green-600"
                />
                <div>
                  <span className="block text-sm font-semibold text-slate-900">🌱 Vegan</span>
                  <span className="block text-xs text-slate-500 font-normal mt-0.5">Fully plant-based diet, no tier elements</span>
                </div>
              </label>
            </div>
          </div>

          {/* Consumption Spending Level */}
          <div className="space-y-1.5 pt-2">
            <label htmlFor="select-consumption" className="block text-xs font-bold text-slate-700">Shopping & Consumption Level</label>
            <div className="relative">
              <select
                id="select-consumption"
                value={inputs.dietLifestyle.consumptionLevel}
                onChange={e => handleConsumptionChange(e.target.value as CarbonFootprintInputs['dietLifestyle']['consumptionLevel'])}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-hidden focus:ring-2 focus:ring-brand-green-500 focus:bg-white transition-all font-medium appearance-none"
              >
                <option value="low">📉 Low — Minimalist consumer spending (rarely buy clothes/new devices)</option>
                <option value="medium">⚖️ Medium — Average consumer spending (standard apparel, standard upgrades)</option>
                <option value="high">📈 High — Active lifestyle spender (frequent fashion shopping, latest gear)</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-500">
                ▼
              </div>
            </div>
            <p className="text-[11px] text-slate-400 font-normal">How much do you typically spend on newer goods (clothes, gadgets, decor)?</p>
          </div>
        </div>

        {/* --- DYNAMIC STICKY DRAWER FOR IMMEDIATE REALTIME CALCULATING FEEDBACK --- */}
        <div className="p-6 bg-brand-green-700 text-white rounded-[32px] shadow-sm flex flex-col md:flex-row items-center justify-between gap-4 border border-brand-green-600">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className="bg-[#8b8b6b] text-white font-bold px-2 py-0.5 rounded-xs text-[10px] uppercase tracking-wider">
                Live Factor Check
              </span>
              <p className="text-xs text-brand-green-50 font-medium">Annual emissions based on choices:</p>
            </div>
            <div className="flex items-baseline space-x-2">
              <span className="text-3xl sm:text-4xl font-extrabold serif text-[#e5e5dc]">
                {(realTimeEmission.total / 1000).toFixed(2)}
              </span>
              <span className="text-brand-green-100 font-medium text-xs">metric tonnes CO₂e / year</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-2.5 w-full md:w-auto">
            <button
              id="btn-calculate"
              type="submit"
              disabled={isLoading}
              className="flex-1 sm:flex-initial bg-brand-green-500 text-white font-bold hover:bg-[#9c9c7c] px-6 py-3.5 rounded-full text-xs uppercase tracking-wider transition-all hover:scale-[1.02] flex items-center justify-center space-x-2 shadow-xs cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  <span>Processing AI Insights...</span>
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  <span>Get Gemini AI Diagnostic</span>
                </>
              )}
            </button>
          </div>
        </div>

      </form>
    </div>
  );
}
