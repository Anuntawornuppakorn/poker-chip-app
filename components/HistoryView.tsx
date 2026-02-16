
import React, { useState } from 'react';
import { X, Calendar, User, ChevronRight, ChevronDown, Landmark, Banknote, Trash2 } from 'lucide-react';
import { GameSession, Player } from '../types';

interface HistoryViewProps {
  history: GameSession[];
  onClose: () => void;
  onDeleteSession: (id: string) => void;
}

const HistoryView: React.FC<HistoryViewProps> = ({ history, onClose, onDeleteSession }) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const chipToBaht = (chips: number) => chips / 4;

  const formatDate = (timestamp: number) => {
    return new Intl.DateTimeFormat('th-TH', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(timestamp));
  };

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div 
        className="absolute inset-0 bg-slate-950/95 backdrop-blur-md animate-in fade-in duration-300"
        onClick={onClose}
      />
      
      <div className="relative bg-slate-900 border-t sm:border border-slate-800 w-full max-w-lg rounded-t-[2.5rem] sm:rounded-[2.5rem] shadow-2xl overflow-hidden animate-in slide-in-from-bottom sm:zoom-in duration-300 flex flex-col h-[92vh]">
        <div className="w-12 h-1.5 bg-slate-800 rounded-full mx-auto mt-4 mb-2 sm:hidden" />
        
        <div className="p-8 border-b border-slate-800/50 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="bg-indigo-500/10 p-2.5 rounded-2xl">
              <Calendar className="w-6 h-6 text-indigo-400" />
            </div>
            <div>
              <h2 className="text-xl font-black text-white tracking-tight leading-none mb-1">Game Logs</h2>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Past Sessions History</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-500 active:scale-90 transition-all">
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar">
          {history.length === 0 ? (
            <div className="text-center py-24 space-y-4">
              <Landmark className="w-16 h-16 text-slate-800 mx-auto" />
              <p className="text-slate-500 font-medium">No sessions archived yet.<br/>Finish a game to save records here.</p>
            </div>
          ) : (
            history.map((session) => (
              <div 
                key={session.id} 
                className={`bg-slate-950/50 border rounded-[2rem] overflow-hidden transition-all duration-300 ${
                  expandedId === session.id ? 'border-indigo-500/30 ring-1 ring-indigo-500/10' : 'border-slate-800/50'
                }`}
              >
                <div 
                  className="p-5 flex items-center justify-between cursor-pointer active:bg-slate-900/50 transition-all"
                  onClick={() => toggleExpand(session.id)}
                >
                  <div className="flex items-center gap-4">
                    <div className="bg-slate-900 w-12 h-12 rounded-2xl flex items-center justify-center border border-slate-800/50">
                      <Banknote className="w-5 h-5 text-indigo-400" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white tracking-tight">{formatDate(session.date)}</h3>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[10px] text-slate-500 font-black uppercase tracking-widest">฿{chipToBaht(session.totalBuyIn).toLocaleString()} Volume</span>
                        <span className="text-slate-700 text-[10px]">•</span>
                        <span className="text-[10px] text-indigo-400 font-bold uppercase tracking-widest">{session.players.length} Players</span>
                      </div>
                    </div>
                  </div>
                  {expandedId === session.id ? <ChevronDown size={20} className="text-slate-500" /> : <ChevronRight size={20} className="text-slate-500" />}
                </div>

                {expandedId === session.id && (
                  <div className="px-5 pb-5 animate-in slide-in-from-top-4 duration-300">
                    <div className="h-px bg-slate-800/50 mb-5" />
                    
                    <div className="space-y-3">
                      {session.players.map((p) => {
                        const entryFee = p.buyIn > 0 ? 400 : 0;
                        const playableChips = p.buyIn - entryFee;
                        const profit = p.cashOut - playableChips;
                        const isWinner = profit > 0;
                        
                        return (
                          <div key={p.id} className="flex items-center justify-between bg-slate-900/40 p-3 rounded-2xl border border-slate-800/30">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-xl bg-slate-800 flex items-center justify-center text-xs font-bold text-slate-400">
                                {p.name.charAt(0).toUpperCase()}
                              </div>
                              <span className="text-xs font-bold text-slate-200">{p.name}</span>
                            </div>
                            <div className="text-right">
                              <div className={`text-[11px] font-black ${isWinner ? 'text-emerald-500' : profit < 0 ? 'text-rose-500' : 'text-slate-500'}`}>
                                {profit > 0 ? '+' : ''}฿{chipToBaht(profit).toLocaleString()}
                              </div>
                              <div className="text-[9px] text-slate-600 font-bold">
                                In: {p.buyIn.toLocaleString()} / Out: {p.cashOut.toLocaleString()}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    <div className="mt-5 flex items-center justify-between pt-4 border-t border-slate-800/50">
                       <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          if(window.confirm('Delete this session record permanently?')) {
                            onDeleteSession(session.id);
                          }
                        }}
                        className="flex items-center gap-1.5 text-rose-500/50 hover:text-rose-500 transition-all text-[10px] font-black uppercase tracking-widest"
                       >
                         <Trash2 size={14} /> Delete Entry
                       </button>
                       <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest italic opacity-40">Session ID: {session.id.split('-')[0]}</div>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        <div className="p-8 border-t border-slate-800/50 pb-12 sm:pb-8">
          <button 
            onClick={onClose}
            className="w-full bg-slate-800 hover:bg-slate-700 text-white font-black py-4 rounded-2xl transition-all active:scale-[0.98]"
          >
            Close History
          </button>
        </div>
      </div>
    </div>
  );
};

export default HistoryView;
