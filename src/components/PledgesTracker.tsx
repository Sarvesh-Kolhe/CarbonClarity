import React from 'react';
import { Award, CheckCircle, Circle, Trash2, ArrowRight, TrendingDown, Leaf, Smile } from 'lucide-react';
import { CarbonPledge } from '../types.js';

interface PledgesTrackerProps {
  pledges: CarbonPledge[];
  onTogglePledgeStatus: (id: string) => void;
  onRemovePledge: (id: string) => void;
  onGoToDashboard: () => void;
}

export default function PledgesTracker({ pledges, onTogglePledgeStatus, onRemovePledge, onGoToDashboard }: PledgesTrackerProps) {
  
  const activePledges = React.useMemo(() => pledges.filter(p => p.status === 'pledged'), [pledges]);
  const completedPledges = React.useMemo(() => pledges.filter(p => p.status === 'completed'), [pledges]);

  const totalCarbonAverted = React.useMemo(() => completedPledges.reduce((sum, p) => sum + p.impactKg, 0), [completedPledges]);
  const potentialCarbonAverted = React.useMemo(() => activePledges.reduce((sum, p) => sum + p.impactKg, 0), [activePledges]);
  
  const completionPercentage = React.useMemo(() => pledges.length > 0
    ? Math.round((completedPledges.length / pledges.length) * 100)
    : 0, [pledges, completedPledges]);

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      
      {/* Visual Title / Meta */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-brand-green-100 pb-4 gap-4">
        <div className="space-y-1">
          <h3 className="font-bold text-2xl text-slate-800 serif flex items-center gap-2">
            <Award className="h-5 w-5 text-brand-green-600" />
            <span>Pledges & Carbon Actions</span>
          </h3>
          <p className="text-xs text-slate-500">Track actions you have committed to and measure real annual decarbonization gains</p>
        </div>
      </div>

      {pledges.length === 0 ? (
        /* Empty State with redirect CTA */
        <div className="bg-[#fafaf6] border border-brand-green-100 rounded-[32px] p-12 text-center max-w-xl mx-auto space-y-5 shadow-xs">
          <div className="text-5xl">🌱</div>
          <h4 className="text-xl font-bold text-slate-800 serif">No Active Pledges Found</h4>
          <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed font-normal">
            Pledges represent day-to-day choices (like active commuting, nutrition swaps, and solar efficiency) that help align your real footprint with global parameters. Use the main Carbon Calculator first, get your Gemini AI diagnostic, then pledge specific actions.
          </p>
          <button
            id="btn-pledge-redirect"
            onClick={onGoToDashboard}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-brand-green-600 text-white font-bold text-xs uppercase tracking-wider hover:bg-brand-green-700 transition-all hover:scale-[1.02] cursor-pointer"
          >
            <span>Run Calculation Now</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      ) : (
        /* Content layout split into Stats and checklist tables */
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Stats card (take 1 column in desktop) */}
          <div className="bg-white border border-brand-green-100 rounded-[32px] p-6 shadow-xs h-fit space-y-6">
            <h4 className="font-extrabold text-slate-800 serif text-lg border-b border-brand-green-50 pb-3">Pledge Analytics</h4>
            
            <div className="space-y-4">
              {/* Progress visual */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-xs font-bold text-slate-500">
                  <span>Pledge Success Ratio</span>
                  <span className="text-brand-green-600">{completionPercentage}%</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden mt-1.5">
                  <div 
                    className="bg-brand-green-500 h-full rounded-full transition-all duration-500"
                    style={{ width: `${completionPercentage}%` }}
                  />
                </div>
              </div>

              {/* Total Carbon Averted */}
              <div className="pt-2">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Real Carbon Averted</span>
                <span className="text-2xl font-black text-brand-green-600 flex items-center gap-1 serif">
                  <Leaf className="h-5 w-5" />
                  <span>{totalCarbonAverted} kg / yr</span>
                </span>
                <p className="text-[10px] text-slate-400 font-normal mt-0.5">Calculated based on completed action items.</p>
              </div>

              {/* Potential Carbon to Save */}
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Potential Carbon Remaining</span>
                <span className="text-lg font-bold text-amber-700 flex items-center gap-1 serif">
                  <TrendingDown className="h-4 w-4" />
                  <span>{potentialCarbonAverted} kg / yr</span>
                </span>
                <p className="text-[10px] text-slate-400 font-normal">Pending inside your ongoing active list.</p>
              </div>
            </div>

            {totalCarbonAverted > 0 && (
              <div className="bg-[#fafaf4] text-brand-green-800 border border-brand-green-100 p-4 rounded-2xl text-xs space-y-1.5">
                <div className="flex items-center gap-1 font-bold">
                  <Smile className="h-4 w-4 text-brand-green-600" />
                  <span>Climate Star!</span>
                </div>
                <p className="font-normal text-[11px] leading-relaxed text-slate-600">
                  Congratulations! Saving {totalCarbonAverted} kg of CO₂e offset represents planting {Math.round(totalCarbonAverted / 22)} standard trees and letting them mature for 1 year!
                </p>
              </div>
            )}
          </div>

          {/* Checklist of pledges (takes 2 columns) */}
          <div className="bg-white border border-brand-green-100 rounded-[32px] p-6 shadow-xs md:col-span-2 space-y-6">
            
            {/* Active commitments */}
            <div className="space-y-3">
              <h4 className="font-extrabold text-slate-800 serif flex items-center gap-2 text-base">
                <span className="text-[#a44d36]">🔵</span> Committed Lifestyle Upgrades
              </h4>
              
              {activePledges.length === 0 ? (
                <p className="text-xs text-slate-400 italic">No pending pledges. Excellent job completing all targets, or add new targets under the Dashboard tab.</p>
              ) : (
                <div className="space-y-2.5">
                  {activePledges.map((pledge) => (
                    <div 
                      key={pledge.id}
                      className="flex items-start justify-between p-3.5 bg-slate-50/50 hover:bg-[#fcfbf9] border border-brand-green-100 rounded-2xl group transition-all"
                    >
                      <div className="flex items-start gap-3">
                        <button
                          id={`btn-toggle-pledge-${pledge.id}`}
                          onClick={() => onTogglePledgeStatus(pledge.id)}
                          className="mt-0.5 text-slate-400 hover:text-brand-green-600 scale-110 cursor-pointer"
                          title="Mark action as completed"
                          aria-label={`Mark commitment "${pledge.actionTitle}" as completed`}
                        >
                          <Circle className="h-5 w-5" />
                        </button>
                        <div>
                          <span className="block text-sm font-semibold text-slate-800 leading-snug">{pledge.actionTitle}</span>
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-sm uppercase tracking-wide bg-slate-200 text-slate-500 mt-1 inline-block">
                            {pledge.category}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center space-x-3">
                        <span className="text-xs font-bold text-brand-green-600 font-mono whitespace-nowrap">
                          -{pledge.impactKg} kg
                        </span>
                        <button
                          id={`btn-remove-pledge-${pledge.id}`}
                          onClick={() => onRemovePledge(pledge.id)}
                          className="text-slate-400 hover:text-red-600 p-1 group-hover:opacity-100 opacity-20 sm:opacity-0 transition-opacity cursor-pointer"
                          title="Discard pledge target"
                          aria-label={`Remove commitment "${pledge.actionTitle}"`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Completed commitments */}
            <div className="space-y-3 pt-4 border-t border-brand-green-100">
              <h4 className="font-extrabold text-slate-800 serif flex items-center gap-2 text-base">
                <span className="text-brand-green-600">🟢</span> Completed Carbon-Saving Achievements
              </h4>
              
              {completedPledges.length === 0 ? (
                <p className="text-xs text-slate-400 italic">No achievements recorded in this session. Tap checkboxes above as you practice food swaps or energy saving!</p>
              ) : (
                <div className="space-y-2.5">
                  {completedPledges.map((pledge) => (
                    <div 
                      key={pledge.id}
                      className="flex items-start justify-between p-3.5 bg-emerald-50/10 border border-brand-green-100 rounded-2xl group transition-all"
                    >
                      <div className="flex items-start gap-3">
                        <button
                          id={`btn-uncheck-pledge-${pledge.id}`}
                          onClick={() => onTogglePledgeStatus(pledge.id)}
                          className="mt-0.5 text-brand-green-600 hover:text-slate-400 scale-110 cursor-pointer"
                          title="Revert back to ongoing commitments"
                          aria-label={`Revert achievement "${pledge.actionTitle}" back to active commitment list`}
                        >
                          <CheckCircle className="h-5 w-5" />
                        </button>
                        <div>
                          <span className="block text-sm font-semibold text-slate-600 line-through decoration-slate-350">{pledge.actionTitle}</span>
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-sm uppercase tracking-wide bg-brand-green-50 text-brand-green-700 mt-1 inline-block">
                            {pledge.category}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center space-x-3">
                        <span className="text-xs font-bold text-slate-400 font-mono whitespace-nowrap">
                          -{pledge.impactKg} kg (SAVED)
                        </span>
                        <button
                          id={`btn-remove-completed-pledge-${pledge.id}`}
                          onClick={() => onRemovePledge(pledge.id)}
                          className="text-slate-400 hover:text-red-300 p-1 group-hover:opacity-100 opacity-20 sm:opacity-0 transition-opacity cursor-pointer"
                          title="Discard achievement log"
                          aria-label={`Remove achievement "${pledge.actionTitle}"`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>

        </div>
      )}

    </div>
  );
}
