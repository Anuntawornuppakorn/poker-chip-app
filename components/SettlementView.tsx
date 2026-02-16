
import React, { useMemo } from 'react';
import { X, ArrowRight, CheckCircle2, Copy, PartyPopper, Archive } from 'lucide-react';
import { Player, Settlement } from '../types';

interface SettlementViewProps {
  players: Player[];
  onClose: () => void;
  onArchive: () => void;
}

const SettlementView: React.FC<SettlementViewProps> = ({ players, onClose, onArchive }) => {
  const chipToBaht = (chips: number) => chips / 4;

  const settlements = useMemo(() => {
    // Hidden internal net calculation accounting for the 400-chip fee
    const nets = players.map(p => {
      const entryFee = p.buyIn > 0 ? 400 : 0;
      const playableChips = p.buyIn - entryFee;
      return {
        name: p.name,
        net: p.cashOut - playableChips
      };
    });

    const debtors = nets.filter(p => p.net < 0).map(p => ({ ...p, absNet: Math.abs(p.net) })).sort((a, b) => b.absNet - a.absNet);
    const creditors = nets.filter(p => p.net > 0).sort((a, b) => b.net - a.net);

    const result: Settlement[] = [];
    let dIdx = 0;
    let cIdx = 0;

    while (dIdx < debtors.length && cIdx < creditors.length) {
      const debtor = debtors[dIdx];
      const creditor = creditors[cIdx];
      const amount = Math.min(debtor.absNet, creditor.net);
      
      if (amount > 0) {
        result.push({
          from: debtor.name,
          to: creditor.name,
          amount: chipToBaht(amount)
        });
      }

      debtor.absNet -= amount;
      creditor.net -= amount;

      if (debtor.absNet <= 0.01) dIdx++;
      if (creditor.net <= 0.01) cIdx++;
    }

    return result;
  }, [players]);

  const copyToClipboard = () => {
    const text = settlements
      .map(s => `${s.from} ➔ ${s.to}: ฿${s.amount.toLocaleString()}`)
      .join('\n');
    navigator.clipboard.writeText(`--- Poker Payouts (Ratio 4:1) ---\n${text}\n--------------------`);
    alert('Copied to clipboard!');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div 
        className="absolute inset-0 bg-slate-950/95 backdrop-blur-md animate-in fade-in duration-300"
        onClick={onClose}
      />
      
      <div className="relative bg-slate-900 border-t sm:border border-slate-800 w-full max-w-lg rounded-t-[2.5rem] sm:rounded-[2.5rem] shadow-2xl overflow-hidden animate-in slide-in-from-bottom sm:zoom-in duration-300 flex flex-col max-h-[92vh]">
        <div className="w-12 h-1.5 bg-slate-800 rounded-full mx-auto mt-4 mb-2 sm:hidden" />
        
        <div className="p-8 border-b border-slate-800/50 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="bg-emerald-500/10 p-2.5 rounded-2xl">
              <PartyPopper className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <h2 className="text-xl font-black text-white tracking-tight leading-none mb-1">Final Payouts</h2>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Calculated based on 4:1 Ratio</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-500 active:scale-90 transition-all">
            <X size={24} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-3 no-scrollbar">
          {settlements.length === 0 ? (
            <div className="text-center py-12 space-y-4">
              <CheckCircle2 className="w-16 h-16 text-emerald-500/20 mx-auto" />
              <p className="text-slate-500 font-medium">No payouts needed.<br/>Everything is balanced.</p>
            </div>
          ) : (
            settlements.map((s, idx) => (
              <div key={idx} className="bg-slate-950/50 border border-slate-800/50 rounded-3xl p-5 flex items-center justify-between relative group overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500/20" />
                <div className="flex flex-col gap-0.5">
                  <span className="text-[9px] text-slate-600 font-black uppercase tracking-widest">Payer</span>
                  <span className="text-base font-bold text-white">{s.from}</span>
                </div>
                
                <div className="flex flex-col items-center px-4">
                  <div className="bg-emerald-500/10 px-3 py-1 rounded-full mb-1 border border-emerald-500/20">
                    <span className="text-sm font-black text-emerald-400">฿{s.amount.toLocaleString()}</span>
                  </div>
                  <ArrowRight className="text-slate-700 w-4 h-4" />
                </div>

                <div className="flex flex-col items-end gap-0.5 text-right">
                  <span className="text-[9px] text-slate-600 font-black uppercase tracking-widest">Recipient</span>
                  <span className="text-base font-bold text-white">{s.to}</span>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="p-8 border-t border-slate-800/50 flex flex-col gap-3 pb-12 sm:pb-8">
          <button 
            onClick={copyToClipboard}
            className="w-full bg-slate-800 hover:bg-slate-700 text-white font-black py-4 rounded-2xl flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
          >
            <Copy size={18} /> Share Results (THB)
          </button>
          <button 
            onClick={onArchive}
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-black py-4 rounded-2xl flex items-center justify-center gap-2 transition-all active:scale-[0.98] shadow-xl shadow-indigo-500/20"
          >
            <Archive size={18} /> Finish & Archive Session
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettlementView;
