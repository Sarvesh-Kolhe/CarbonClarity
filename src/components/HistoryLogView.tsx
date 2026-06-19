import React from 'react';
import { 
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as ChartTooltip
} from 'recharts';
import { History, Calendar, Trash2, ArrowUpRight, BookOpen, ExternalLink, Milestone, Download } from 'lucide-react';
import { FootprintHistoryLog } from '../types.js';

interface HistoryLogViewProps {
  logs: FootprintHistoryLog[];
  onDeleteLog: (id: string) => void;
  onRestoreInputs: (log: FootprintHistoryLog) => void;
}

export default function HistoryLogView({ logs, onDeleteLog, onRestoreInputs }: HistoryLogViewProps) {
  
  // Format history for chart
  const chartData = React.useMemo(() => [...logs]
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .map(log => ({
      date: new Date(log.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
      emissions: parseFloat((log.breakdown.total / 1000).toFixed(2)),
      transport: parseFloat((log.breakdown.transport / 1000).toFixed(2)),
      homeEnergy: parseFloat((log.breakdown.homeEnergy / 1000).toFixed(2)),
      dietLifestyle: parseFloat((log.breakdown.dietLifestyle / 1000).toFixed(2)),
    })), [logs]);

  // Download logic mapping state to a simple clean text file/CSV
  const exportHistoryToCSV = () => {
    if (logs.length === 0) return;
    const headers = 'Date,Transport (kg),Home Utilities (kg),Diet-Lifestyle (kg),Total Emissions (kgCO2e)\n';
    const rows = logs.map(log => 
      `"${new Date(log.date).toLocaleString()}",${log.breakdown.transport},${log.breakdown.homeEnergy},${log.breakdown.dietLifestyle},${log.breakdown.total}`
    ).join('\n');
    
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `carbon-platform-history-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      
      {/* Visual Title / Meta */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-brand-green-100 pb-4 gap-4">
        <div className="space-y-1">
          <h3 className="font-bold text-2xl text-slate-800 serif flex items-center gap-2">
            <History className="h-5 w-5 text-brand-green-600" />
            <span>Emission Tracking History</span>
          </h3>
          <p className="text-xs text-slate-500">Track and assess your decarbonization efforts across progressive log submissions</p>
        </div>
        {logs.length > 0 && (
          <button
            id="btn-export-csv"
            onClick={exportHistoryToCSV}
            className="px-4 py-2.5 text-[10px] font-bold uppercase tracking-wider bg-white text-slate-700 rounded-full border border-brand-green-100 hover:bg-[#fafaf6] flex items-center gap-1.5 transition-colors cursor-pointer"
            aria-label="Export carbon calculation history as CSV file report"
          >
            <Download className="h-4 w-4" />
            <span>Export CSV Report</span>
          </button>
        )}
      </div>

      {logs.length === 0 ? (
        /* Empty State */
        <div className="bg-[#fafaf6] border border-brand-green-100 rounded-[32px] p-12 text-center max-w-xl mx-auto space-y-4">
          <div className="text-5xl">⏳</div>
          <h4 className="text-xl font-bold text-slate-800 serif">No Logs Registered</h4>
          <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed font-normal font-sans">
            Your calculation submission timeline is completely clean. Return to the primary calculator screen, record your energy consumption levels and calculate to lock in your carbon scores.
          </p>
        </div>
      ) : (
        /* Dynamic History Panel */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Timeline chart takes 2 columns */}
          <div className="bg-white border border-brand-green-100 rounded-[32px] p-6 shadow-xs lg:col-span-2 space-y-4">
            <h4 className="font-bold text-slate-800 text-lg serif flex items-center gap-2">
              <span>📈</span> Progressive Emission Trajectory
            </h4>
            <div className="h-64 sm:h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e5dc" />
                  <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#3c3c32' }} axisLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: '#3c3c32' }} axisLine={false} />
                  <ChartTooltip 
                    contentStyle={{ outline: 'none', borderRadius: '16px', border: '1px solid #e5e5dc', fontSize: '11px' }}
                    labelStyle={{ fontWeight: 'bold' }}
                    formatter={(value) => [`${value} t CO₂e`, 'Total Carbon Footprint']}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="emissions" 
                    name="Emissions" 
                    stroke="#5a5a40" 
                    strokeWidth={3} 
                    activeDot={{ r: 6 }} 
                  />
                  <Line 
                    type="monotone" 
                    dataKey="transport" 
                    name="Transport" 
                    stroke="#a44d36" 
                    strokeWidth={1.5} 
                    strokeDasharray="4 4"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="homeEnergy" 
                    name="Home Energy" 
                    stroke="#ced0b2" 
                    strokeWidth={1.5} 
                    strokeDasharray="4 4"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <p className="text-[10px] text-slate-400 italic text-center">
              Tracing emissions over time in metric tonnes. Target a downward slope to visualize efficient lifestyle changes.
            </p>
          </div>

          {/* Quick Metrics of history list takes 1 column */}
          <div className="bg-white border border-brand-green-100 rounded-[32px] p-6 shadow-xs space-y-4 flex flex-col justify-between">
            <div>
              <h4 className="font-bold text-slate-800 text-lg serif flex items-center gap-2 border-b border-brand-green-50 pb-3 mb-3">
                <span>🎯</span> Tracking Quick Facts
              </h4>
              <div className="space-y-4 pt-2">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">Total Log entries</span>
                  <span className="text-2xl font-black text-slate-800">{logs.length} logged data sets</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">Peak Carbon Logged</span>
                  <span className="text-xl font-bold text-[#a44d36]">
                    {(Math.max(...logs.map(l => l.breakdown.total)) / 1000).toFixed(2)} t CO₂e
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">Lowest Carbon Logged</span>
                  <span className="text-xl font-bold text-brand-green-600">
                    {(Math.min(...logs.map(l => l.breakdown.total)) / 1000).toFixed(2)} t CO₂e
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-slate-50 border border-brand-green-50 p-3.5 rounded-2xl flex items-start gap-2.5">
              <span className="text-sm">♻️</span>
              <p className="text-[10px] text-slate-500 font-medium">
                Consistently updating logs helps highlight seasonality patterns, like winter gas heating spikes and flight spikes.
              </p>
            </div>
          </div>

          {/* Core Logs Grid & Restore tools */}
          <div className="bg-white border border-brand-green-100 rounded-[32px] p-6 shadow-xs lg:col-span-3 space-y-4">
            <h4 className="font-bold text-lg text-slate-800 serif">Log Ledger Registry</h4>
            
            <div className="overflow-x-auto rounded-2xl border border-brand-green-50">
              <table className="min-w-full divide-y divide-brand-green-50 text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
                  <tr>
                    <th scope="col" className="px-4 py-3.5">Submission Date</th>
                    <th scope="col" className="px-4 py-3.5">Transport (kg)</th>
                    <th scope="col" className="px-4 py-3.5">Home Energy (kg)</th>
                    <th scope="col" className="px-4 py-3.5">Diet & Spend (kg)</th>
                    <th scope="col" className="px-4 py-3.5">Grand Total (t)</th>
                    <th scope="col" className="px-4 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-brand-green-50 text-slate-700 font-medium font-sans">
                  {logs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          <Calendar className="h-4 w-4 text-slate-400" />
                          <span>{new Date(log.date).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}</span>
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-[#a44d36]">{log.breakdown.transport} kg</td>
                      <td className="px-4 py-4 whitespace-nowrap text-amber-700">{log.breakdown.homeEnergy} kg</td>
                      <td className="px-4 py-4 whitespace-nowrap text-[#5a5a40]">{log.breakdown.dietLifestyle} kg</td>
                      <td className="px-4 py-4 whitespace-nowrap font-bold text-slate-800">
                        {(log.breakdown.total / 1000).toFixed(2)} t CO₂e
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-right space-x-2">
                        <button
                          id={`btn-restore-${log.id}`}
                          onClick={() => onRestoreInputs(log)}
                          className="px-3.5 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider text-brand-green-700 bg-[#f5f5f0] border border-brand-green-150 hover:bg-brand-green-100 transition-colors cursor-pointer text-center"
                          title="Restore inputs to modification board"
                          aria-label={`Load data set from ${new Date(log.date).toLocaleDateString()} back into input fields`}
                        >
                          Load
                        </button>
                        <button
                          id={`btn-delete-${log.id}`}
                          onClick={() => onDeleteLog(log.id)}
                          className="px-3.5 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider text-red-700 bg-red-50 hover:bg-red-100 transition-colors cursor-pointer text-center"
                          title="Remove from history log"
                          aria-label={`Delete entry from ${new Date(log.date).toLocaleDateString()}`}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* 5. Additional Educational Guide Panel */}
      <section className="bg-[#f5f5f0] border border-brand-green-100 rounded-[32px] p-6 sm:p-8 grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
        <div className="md:col-span-2 space-y-3">
          <span className="text-brand-green-800 text-[10px] font-bold px-3 py-1.5 rounded-full bg-brand-green-50 tracking-wider uppercase">
            Sustainability Science Guide
          </span>
          <h4 className="font-bold text-slate-800 serif text-xl mt-1">Understanding Carbon Equivalents (CO₂e)</h4>
          <p className="text-xs leading-relaxed text-slate-600 font-normal font-sans">
            Carbon dioxide equivalent (CO₂e) standardizes greenhouse gases (e.g. carbon dioxide, methane, nitrous oxide) into a single baseline indicator representing global warming potential. By addressing transportation fuel, residential thermal power, and consumer goods, you make a significant contribution to mitigating this metric.
          </p>
        </div>
        <div className="bg-white/80 rounded-2xl p-5 space-y-2 border border-brand-green-100 shadow-xs">
          <span className="text-lg">🌿</span>
          <h5 className="font-extrabold text-slate-800 text-xs serif">Immediate Reductions Checklist:</h5>
          <ul className="text-[11px] text-slate-600 space-y-1 list-disc list-inside font-normal font-sans">
            <li>Lower dryer runs by air-drying</li>
            <li>Buy local seasonal vegetables</li>
            <li>Use rail instead of flights <span className="font-bold">&lt;350km</span></li>
          </ul>
        </div>
      </section>

    </div>
  );
}
