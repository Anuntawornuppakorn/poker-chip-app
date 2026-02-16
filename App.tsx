
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Plus, 
  Users, 
  RotateCcw,
  CheckCircle2,
  Banknote,
  Undo2,
  X,
  History as HistoryIcon
} from 'lucide-react';
import { Player, Transaction, GameSession } from './types';
import PlayerCard from './components/PlayerCard';
import StatsOverview from './components/StatsOverview';
import AddPlayerModal from './components/AddPlayerModal';
import SettlementView from './components/SettlementView';
import HistoryView from './components/HistoryView';

const App: React.FC = () => {
  const [players, setPlayers] = useState<Player[]>([]);
  const [history, setHistory] = useState<GameSession[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [showSettlement, setShowSettlement] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  
  // Undo State
  const [lastDeletedPlayer, setLastDeletedPlayer] = useState<Player | null>(null);
  const undoTimerRef = useRef<number | null>(null);

  // Load state on mount
  useEffect(() => {
    const savedActive = localStorage.getItem('poker_group_state');
    const savedHistory = localStorage.getItem('poker_history');
    
    if (savedActive) {
      try { setPlayers(JSON.parse(savedActive)); } catch (e) { console.error(e); }
    }
    if (savedHistory) {
      try { setHistory(JSON.parse(savedHistory)); } catch (e) { console.error(e); }
    }
  }, []);

  // Sync active state
  useEffect(() => {
    localStorage.setItem('poker_group_state', JSON.stringify(players));
  }, [players]);

  // Sync history state
  useEffect(() => {
    localStorage.setItem('poker_history', JSON.stringify(history));
  }, [history]);

  const addPlayer = (name: string) => {
    const newPlayer: Player = {
      id: crypto.randomUUID(),
      name,
      buyIn: 0,
      cashOut: 0,
      transactions: []
    };
    setPlayers([...players, newPlayer]);
    setIsAddModalOpen(false);
  };

  const removePlayer = (id: string) => {
    const playerToRemove = players.find(p => p.id === id);
    if (playerToRemove) {
      if (undoTimerRef.current) window.clearTimeout(undoTimerRef.current);
      setLastDeletedPlayer(playerToRemove);
      setPlayers(players.filter(p => p.id !== id));
      undoTimerRef.current = window.setTimeout(() => {
        setLastDeletedPlayer(null);
      }, 6000);
    }
  };

  const undoDelete = () => {
    if (lastDeletedPlayer) {
      setPlayers(prev => [...prev, lastDeletedPlayer]);
      setLastDeletedPlayer(null);
      if (undoTimerRef.current) window.clearTimeout(undoTimerRef.current);
    }
  };

  const updateBuyIn = (id: string, amount: number) => {
    setPlayers(players.map(p => {
      if (p.id === id) {
        const newTransaction: Transaction = {
          id: crypto.randomUUID(),
          type: 'buy-in',
          amount,
          timestamp: Date.now()
        };
        return {
          ...p,
          buyIn: p.buyIn + amount,
          transactions: [...p.transactions, newTransaction]
        };
      }
      return p;
    }));
  };

  const updateCashOut = (id: string, amount: number) => {
    setPlayers(players.map(p => {
      if (p.id === id) {
        const withoutCashOut = p.transactions.filter(t => t.type !== 'cash-out');
        const newTransaction: Transaction = {
          id: crypto.randomUUID(),
          type: 'cash-out',
          amount,
          timestamp: Date.now()
        };
        return {
          ...p,
          cashOut: amount,
          transactions: [...withoutCashOut, newTransaction]
        };
      }
      return p;
    }));
  };

  const resetGame = () => {
    if (window.confirm('คุณต้องการเริ่มเกมใหม่ทั้งหมดใช่หรือไม่? ข้อมูลของโต๊ะปัจจุบันจะหายไป')) {
      setPlayers([]);
      setLastDeletedPlayer(null);
      localStorage.removeItem('poker_group_state');
    }
  };

  const archiveSession = () => {
    const newSession: GameSession = {
      id: crypto.randomUUID(),
      date: Date.now(),
      players: [...players],
      totalBuyIn,
      totalCashOut,
      totalFees
    };
    setHistory([newSession, ...history]);
    setPlayers([]);
    setShowSettlement(false);
    localStorage.removeItem('poker_group_state');
  };

  const totalBuyIn = useMemo(() => players.reduce((acc, p) => acc + p.buyIn, 0), [players]);
  const totalCashOut = useMemo(() => players.reduce((acc, p) => acc + p.cashOut, 0), [players]);
  
  const totalFees = useMemo(() => 
    players.filter(p => p.buyIn > 0).length * 400
  , [players]);

  const tableChipsAvailable = totalBuyIn - totalFees;
  const balanceDifference = tableChipsAvailable - totalCashOut;

  const canSettle = players.length > 0 && Math.abs(balanceDifference) === 0 && totalCashOut > 0;

  return (
    <div className="h-screen-dynamic bg-slate-950 text-slate-50 flex flex-col selection:bg-indigo-500/30 overflow-hidden relative">
      <header className="flex-none pt-safe bg-slate-950/80 backdrop-blur-xl border-b border-slate-800/50 z-40">
        <div className="max-w-xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="bg-gradient-to-br from-indigo-500 to-indigo-700 p-2 rounded-xl shadow-lg shadow-indigo-500/20">
              <Banknote className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight leading-none">Poker Group</h1>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button 
              onClick={() => setShowHistory(true)}
              className="p-2.5 text-slate-400 hover:text-indigo-400 active:bg-slate-900 rounded-full transition-all"
              title="ประวัติการเล่น"
            >
              <HistoryIcon className="w-5 h-5" />
            </button>
            <button 
              onClick={resetGame}
              className="p-2.5 text-slate-400 hover:text-rose-400 active:bg-slate-900 rounded-full transition-all"
              title="ล้างโต๊ะ"
            >
              <RotateCcw className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto px-4 pt-4 pb-48 no-scrollbar max-w-xl mx-auto w-full space-y-6">
        <StatsOverview 
          totalBuyIn={totalBuyIn} 
          totalCashOut={totalCashOut} 
          balanceDifference={balanceDifference}
          playerCount={players.length}
          totalFees={totalFees}
        />

        <div className="flex items-center justify-between px-1">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
            <Users className="w-4 h-4" /> 
            Active Table ({players.length})
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {players.length === 0 ? (
            <div className="bg-slate-900/30 border border-dashed border-slate-800 rounded-3xl p-12 text-center">
              <div className="bg-slate-800/50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-slate-600" />
              </div>
              <p className="text-slate-500 text-sm font-medium">No active table.<br/>Add players or check History.</p>
            </div>
          ) : (
            players.map(player => (
              <PlayerCard 
                key={player.id}
                player={player}
                onAddBuyIn={(amt) => updateBuyIn(player.id, amt)}
                onSetCashOut={(amt) => updateCashOut(player.id, amt)}
                onRemove={() => removePlayer(player.id)}
              />
            ))
          )}
        </div>
      </main>

      {lastDeletedPlayer && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 w-full max-w-xs px-4 z-50 animate-in slide-in-from-bottom-4 duration-300">
          <div className="bg-slate-900/95 backdrop-blur-md border border-slate-700/50 rounded-2xl shadow-2xl p-3 flex items-center justify-between overflow-hidden relative group">
            <div className="flex items-center gap-3">
              <div className="bg-rose-500/10 p-2 rounded-xl">
                <X className="w-4 h-4 text-rose-400" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-bold text-slate-200">{lastDeletedPlayer.name} removed</span>
              </div>
            </div>
            <button 
              onClick={undoDelete}
              className="flex items-center gap-1.5 bg-indigo-500 hover:bg-indigo-400 text-white px-3 py-1.5 rounded-xl text-xs font-black transition-all active:scale-95 shadow-lg shadow-indigo-500/20"
            >
              <Undo2 className="w-3.5 h-3.5" /> UNDO
            </button>
            <div className="absolute bottom-0 left-0 h-1 bg-indigo-500/30 w-full">
              <div className="h-full bg-indigo-500 animate-[shrink_6s_linear_forwards]" style={{width: '100%'}} />
            </div>
          </div>
        </div>
      )}

      <div className="fixed bottom-0 left-0 right-0 z-40 p-4 pb-safe bg-gradient-to-t from-slate-950 via-slate-950 to-transparent">
        <div className="max-w-xl mx-auto flex gap-3 pb-4">
          <button 
            onClick={() => setIsAddModalOpen(true)}
            className="flex-1 bg-slate-900 border border-slate-800 hover:bg-slate-800 text-white h-14 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all active:scale-95 shadow-xl shadow-black/40"
          >
            <Plus className="w-5 h-5 text-indigo-400" /> Player
          </button>
          <button 
            disabled={!canSettle}
            onClick={() => setShowSettlement(true)}
            className={`flex-[1.5] h-14 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all active:scale-95 shadow-xl
              ${canSettle 
                ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-500/20' 
                : 'bg-slate-800 text-slate-500 cursor-not-allowed opacity-50'
              }`}
          >
            <CheckCircle2 className="w-5 h-5" /> Calculate Payout
          </button>
        </div>
      </div>

      <style>{`
        @keyframes shrink {
          from { width: 100%; }
          to { width: 0%; }
        }
      `}</style>

      {isAddModalOpen && (
        <AddPlayerModal 
          onClose={() => setIsAddModalOpen(false)} 
          onSubmit={addPlayer} 
        />
      )}

      {showSettlement && (
        <SettlementView 
          players={players} 
          onClose={() => setShowSettlement(false)}
          onArchive={archiveSession}
        />
      )}

      {showHistory && (
        <HistoryView 
          history={history}
          onClose={() => setShowHistory(false)}
          onDeleteSession={(id) => setHistory(history.filter(s => s.id !== id))}
        />
      )}
    </div>
  );
};

export default App;
