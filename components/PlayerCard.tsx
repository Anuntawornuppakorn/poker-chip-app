
import React, { useState } from 'react';
import { Trash2, Coins, Receipt, History } from 'lucide-react';
import { Player } from '../types';

interface PlayerCardProps {
  player: Player;
  onAddBuyIn: (amount: number) => void;
  onSetCashOut: (amount: number) => void;
  onRemove: () => void;
}

const PlayerCard: React.FC<PlayerCardProps> = ({ 
  player, 
  onAddBuyIn, 
  onSetCashOut, 
  onRemove 
}) => {
  const [isCashOutMode, setIsCashOutMode] = useState(false);
  const [isHistoryExpanded, setIsHistoryExpanded] = useState(false);
  const [inputValue, setInputValue] = useState('');

  // 4 Chips = 1 THB
  const chipToBaht = (chips: number) => chips / 4;

  const hasBoughtIn = player.buyIn > 0;
  // Internal background fee logic (400 chips)
  const entryFee = hasBoughtIn ? 400 : 0;
  const playableChips = Math.max(0, player.buyIn - entryFee);
  
  const hasCashedOut = player.transactions.some(t => t.type === 'cash-out');
  
  // Profit is calculated in the background against the playable base
  const profitChips = hasCashedOut ? player.cashOut - playableChips : -playableChips;
  const profitBaht = chipToBaht(profitChips);
  const isWinner = profitChips > 0;
  const isFinalized = hasCashedOut;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(inputValue);
    if (!isNaN(val) && val >= 0) {
      if (isCashOutMode) {
        onSetCashOut(val);
      } else {
        onAddBuyIn(val);
      }
      setInputValue('');
      (document.activeElement as HTMLElement)?.blur();
    }
  };

  const handleRemoveClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onRemove();
  };

  const formatTime = (timestamp: number) => {
    return new Intl.DateTimeFormat('th-TH', {
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(timestamp));
  };

  const previewBaht = inputValue ? chipToBaht(parseFloat(inputValue)) : 0;

  return (
    <div className="bg-slate-900/40 border border-slate-800 rounded-[2rem] p-5 shadow-sm active:border-slate-700 transition-all">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-slate-800 to-slate-700 flex items-center justify-center text-lg font-black text-indigo-400 shadow-inner">
            {player.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-white tracking-tight">{player.name}</h3>
            </div>
            {isFinalized ? (
              <div className={`text-[10px] font-black uppercase tracking-widest ${isWinner ? 'text-emerald-500' : 'text-rose-500'}`}>
                {profitChips >= 0 ? 'Profit' : 'Loss'}: {Math.abs(profitChips).toLocaleString()} Chips (฿{Math.abs(profitBaht).toLocaleString()})
              </div>
            ) : (
              <div className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
                In Game: {playableChips.toLocaleString()} Chips
              </div>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-1.5">
          <button 
            type="button"
            onClick={() => setIsHistoryExpanded(!isHistoryExpanded)}
            className={`p-2.5 rounded-xl transition-all active:scale-90 ${isHistoryExpanded ? 'bg-indigo-500/10 text-indigo-400' : 'text-slate-500'}`}
          >
            <History size={18} />
          </button>
          <button 
            type="button"
            onClick={handleRemoveClick}
            className="p-2.5 text-slate-600 hover:text-rose-400 active:scale-90 transition-all cursor-pointer"
          >
            <Trash2 size={18} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-5">
        <div className="bg-slate-950/50 rounded-2xl p-3 border border-slate-800/50">
          <span className="text-[9px] text-slate-500 uppercase font-black tracking-widest block mb-0.5">Paid (Baht)</span>
          <span className="text-sm font-bold text-white">฿{chipToBaht(player.buyIn).toLocaleString()}</span>
          <span className="text-[10px] text-slate-600 block">{player.buyIn.toLocaleString()} Chips</span>
        </div>
        <div className={`rounded-2xl p-3 border transition-all ${
          isFinalized ? 'bg-slate-950/50 border-emerald-500/30 ring-1 ring-emerald-500/20' : 'bg-slate-950/20 border-dashed border-slate-800 opacity-60'
        }`}>
          <span className="text-[9px] text-slate-500 uppercase font-black tracking-widest block mb-0.5">Cash Out (Baht)</span>
          <span className="text-sm font-bold text-white">{isFinalized ? `฿${chipToBaht(player.cashOut).toLocaleString()}` : '—'}</span>
          <span className="text-[10px] text-slate-600 block">{isFinalized ? `${player.cashOut.toLocaleString()} Chips` : '—'}</span>
        </div>
      </div>

      {isHistoryExpanded && (
        <div className="mb-5 bg-slate-950/30 rounded-2xl p-3 border border-slate-800/40 animate-in slide-in-from-top-2 duration-200">
          <div className="space-y-1.5 max-h-32 overflow-y-auto no-scrollbar">
            {player.transactions.length === 0 ? (
              <p className="text-[10px] text-slate-600 text-center py-2">No history</p>
            ) : (
              [...player.transactions].reverse().map((t) => (
                <div key={t.id} className="flex items-center justify-between text-[11px] py-1 border-b border-slate-800/30 last:border-0">
                  <div className="flex items-center gap-2">
                    <span className={t.type === 'buy-in' ? 'text-indigo-400' : 'text-emerald-400'}>
                      {t.type === 'buy-in' ? 'Buy' : 'Out'}
                    </span>
                    <span className="text-slate-600 font-mono">{formatTime(t.timestamp)}</span>
                  </div>
                  <span className="font-bold text-slate-300">{t.amount.toLocaleString()} Chips</span>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-2">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <input 
              type="number"
              inputMode="decimal"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder={isCashOutMode ? "Total Chips Out..." : "Add Chips..."}
              className="w-full bg-slate-950 border border-slate-800 rounded-2xl py-3 px-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/30 transition-all placeholder:text-slate-700"
            />
            {inputValue && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-black text-indigo-400 bg-slate-900 px-2 py-1 rounded-lg border border-slate-800">
                ฿{previewBaht.toLocaleString()}
              </div>
            )}
          </div>
          <button 
            type="button"
            onClick={() => setIsCashOutMode(!isCashOutMode)}
            className={`px-3 rounded-2xl border transition-all active:scale-95 ${isCashOutMode ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-slate-800 border-slate-700 text-slate-400'}`}
          >
            {isCashOutMode ? <Receipt size={18} /> : <Coins size={18} />}
          </button>
          <button 
            type="submit"
            disabled={inputValue === ''}
            className={`px-5 rounded-2xl font-bold text-white transition-all active:scale-95 disabled:opacity-30 ${isCashOutMode ? 'bg-emerald-600' : 'bg-indigo-600'}`}
          >
            {isCashOutMode ? 'Set' : 'Add'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default PlayerCard;
