
import React from 'react';
import { TrendingUp, ArrowUpRight, ArrowDownLeft, Info } from 'lucide-react';

interface StatsOverviewProps {
  totalBuyIn: number;
  totalCashOut: number;
  balanceDifference: number;
  playerCount: number;
  totalFees: number;
}

const StatsOverview: React.FC<StatsOverviewProps> = ({ 
  totalBuyIn, 
  totalCashOut, 
  balanceDifference,
  playerCount,
  totalFees
}) => {
  // Table Chips = Total Purchased - Entry Fees (Hidden from UI but used for balance)
  const tableChipsAvailable = totalBuyIn - totalFees;
  const tableDiff = tableChipsAvailable - totalCashOut;
  const isBalanced = Math.abs(tableDiff) === 0 && totalBuyIn > 0;
  
  // 4 Chips = 1 THB
  const toBaht = (chips: number) => chips / 4;

  return (
    <div className="space-y-3">
      {/* Ratio Info */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <div className="bg-indigo-500/10 p-1 rounded-md">
            <Info size={12} className="text-indigo-400" />
          </div>
          <span className="text-[10px] font-black uppercase tracking-widest text-indigo-400/80">Rate: 4 Chips = 1 THB</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {/* Total Buy-in (Cash Inflow) */}
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-3xl shadow-lg shadow-black/20">
          <div className="flex items-center gap-2 mb-2">
            <ArrowUpRight className="w-3.5 h-3.5 text-indigo-400" />
            <span className="text-slate-500 text-[10px] font-black uppercase tracking-widest">Total Paid</span>
          </div>
          <div className="text-xl font-bold text-white tracking-tight">
            ฿{toBaht(totalBuyIn).toLocaleString()}
          </div>
          <div className="text-[10px] text-slate-500 font-medium">
            {totalBuyIn.toLocaleString()} Chips
          </div>
        </div>

        {/* Total Cash Out */}
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-3xl shadow-lg shadow-black/20">
          <div className="flex items-center gap-2 mb-2">
            <ArrowDownLeft className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-slate-500 text-[10px] font-black uppercase tracking-widest">Total Out</span>
          </div>
          <div className="text-xl font-bold text-white tracking-tight">
            ฿{toBaht(totalCashOut).toLocaleString()}
          </div>
          <div className="text-[10px] text-slate-500 font-medium">
            {totalCashOut.toLocaleString()} Chips
          </div>
        </div>

        {/* Status Box - Hidden internal math ensures balance matches table state */}
        <div className={`col-span-2 p-4 rounded-3xl border transition-all duration-300 flex items-center justify-between shadow-lg shadow-black/20
          ${isBalanced 
            ? 'bg-emerald-950/20 border-emerald-500/30 shadow-emerald-500/5' 
            : tableDiff !== 0 
              ? 'bg-amber-950/20 border-amber-500/30 shadow-amber-500/5'
              : 'bg-slate-900 border-slate-800'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-2xl ${isBalanced ? 'bg-emerald-500/10' : 'bg-amber-500/10'}`}>
              <TrendingUp className={`w-5 h-5 ${isBalanced ? 'text-emerald-400' : 'text-amber-400'}`} />
            </div>
            <div>
              <span className="text-slate-500 text-[10px] font-black uppercase tracking-widest block leading-none mb-1">Session Status</span>
              <div className={`text-base font-black tracking-tight ${isBalanced ? 'text-emerald-400' : 'text-amber-400'}`}>
                {totalBuyIn > 0 ? (
                  isBalanced ? 'Balanced' : 'Awaiting Balance'
                ) : 'Table Empty'}
              </div>
            </div>
          </div>

          <div className="text-right">
            <span className="text-slate-500 text-[10px] font-black uppercase tracking-widest block leading-none mb-1">Diff (Chips)</span>
            <div className={`text-base font-black tracking-tight ${isBalanced ? 'text-emerald-400' : 'text-amber-400'}`}>
              {totalBuyIn > 0 ? (
                isBalanced ? '0' : `${tableDiff > 0 ? '-' : '+'}${Math.abs(tableDiff).toLocaleString()}`
              ) : '—'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatsOverview;
