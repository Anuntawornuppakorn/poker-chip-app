import React, { useState, useEffect } from 'react';
import { initializeApp } from "firebase/app";
import { getDatabase, ref, onValue, set, push, update } from "firebase/database";
import { Plus, Users, RotateCcw, CheckCircle2, Banknote, History, Trash2 } from 'lucide-react';

// --- คอนฟิก Firebase ของคุณ ---
const firebaseConfig = {
  apiKey: "AIzaSyBB-zyqFADwGrINkMk-eZjMEaeN1Ar895Y",
  authDomain: "poker-chip-app-7dd1b.firebaseapp.com",
  databaseURL: "https://poker-chip-app-7dd1b-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "poker-chip-app-7dd1b",
  storageBucket: "poker-chip-app-7dd1b.firebasestorage.app",
  messagingSenderId: "285173003133",
  appId: "1:285173003133:web:783cb2734db5089b4ed214",
  measurementId: "G-PSPDMB0CB6"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

const PokerApp = () => {
  const [players, setPlayers] = useState<any>({});
  const [playerName, setPlayerName] = useState('');
  const [loading, setLoading] = useState(true);

  // ดึงข้อมูล Real-time จาก Firebase
  useEffect(() => {
    const playersRef = ref(db, 'players');
    return onValue(playersRef, (snapshot) => {
      const data = snapshot.val();
      setPlayers(data || {});
      setLoading(false);
    });
  }, []);

  // ฟังก์ชันเพิ่มผู้เล่น
  const addPlayer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!playerName.trim()) return;
    const playersRef = ref(db, 'players');
    const newPlayerRef = push(playersRef);
    set(newPlayerRef, {
      name: playerName,
      buyIn: 0,
      cashOut: 0,
      status: 'playing'
    });
    setPlayerName('');
  };

  // ฟังก์ชันอัปเดตยอด Chip (Buy-in / Cash-out)
  const updateAmount = (id: string, type: 'buyIn' | 'cashOut', amount: number) => {
    const playerRef = ref(db, `players/${id}`);
    const currentAmount = players[id][type] || 0;
    update(playerRef, {
      [type]: currentAmount + amount
    });
  };

  // ฟังก์ชัน Reset วง (ลบข้อมูลทั้งหมดเพื่อเริ่มเกมใหม่)
  const resetGame = () => {
    if (window.confirm("คุณต้องการล้างข้อมูลทั้งหมดเพื่อเริ่มเกมใหม่ใช่หรือไม่?")) {
      set(ref(db, 'players'), null);
    }
  };

  const totalBuyIn = Object.values(players).reduce((sum: number, p: any) => sum + (p.buyIn || 0), 0);
  const totalCashOut = Object.values(players).reduce((sum: number, p: any) => sum + (p.cashOut || 0), 0);

  if (loading) return <div className="flex h-screen items-center justify-center bg-slate-900 text-white">กำลังโหลดข้อมูล...</div>;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 font-sans">
      <div className="max-w-md mx-auto space-y-6">
        
        {/* Header & Stats */}
        <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800 shadow-xl">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Banknote className="text-emerald-400" /> Poker Chip
            </h1>
            <button onClick={resetGame} className="p-2 text-slate-400 hover:text-red-400 transition-colors">
              <RotateCcw size={20} />
            </button>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-800/50 p-3 rounded-2xl">
              <p className="text-xs text-slate-400 uppercase tracking-wider">Total Buy-in</p>
              <p className="text-xl font-mono text-emerald-400">{totalBuyIn.toLocaleString()}</p>
            </div>
            <div className="bg-slate-800/50 p-3 rounded-2xl">
              <p className="text-xs text-slate-400 uppercase tracking-wider">In Pot (Gap)</p>
              <p className="text-xl font-mono text-orange-400">{(totalBuyIn - totalCashOut).toLocaleString()}</p>
            </div>
          </div>
        </div>

        {/* Add Player Form */}
        <form onSubmit={addPlayer} className="flex gap-2">
          <input
            type="text"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            placeholder="ชื่อผู้เล่น..."
            className="flex-1 bg-slate-900 border border-slate-800 rounded-2xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
          />
          <button type="submit" className="bg-emerald-500 hover:bg-emerald-600 text-white p-3 rounded-2xl transition-all shadow-lg shadow-emerald-500/20">
            <Plus />
          </button>
        </form>

        {/* Players List */}
        <div className="space-y-3">
          {Object.entries(players).map(([id, player]: [string, any]) => (
            <div key={id} className="bg-slate-900 border border-slate-800 p-4 rounded-3xl shadow-sm">
              <div className="flex justify-between items-start mb-3">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Users size={18} className="text-slate-400" /> {player.name}
                </h3>
                <div className="text-right font-mono">
                  <p className={`text-sm ${player.cashOut - player.buyIn >= 0 ? 'text-emerald-400' : 'text-pink-500'}`}>
                    {player.cashOut - player.buyIn > 0 ? '+' : ''}{(player.cashOut - player.buyIn).toLocaleString()}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] text-slate-500 uppercase ml-1">Buy-in: {player.buyIn}</span>
                  <div className="flex gap-1">
                    <button onClick={() => updateAmount(id, 'buyIn', 100)} className="flex-1 bg-slate-800 py-2 rounded-xl text-xs hover:bg-slate-700">+100</button>
                    <button onClick={() => updateAmount(id, 'buyIn', 500)} className="flex-1 bg-slate-800 py-2 rounded-xl text-xs hover:bg-slate-700">+500</button>
                  </div>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] text-slate-500 uppercase ml-1">Cash-out: {player.cashOut}</span>
                  <div className="flex gap-1">
                    <button onClick={() => updateAmount(id, 'cashOut', 100)} className="flex-1 bg-emerald-500/10 text-emerald-400 py-2 rounded-xl text-xs hover:bg-emerald-500/20">+100</button>
                    <button onClick={() => updateAmount(id, 'cashOut', 500)} className="flex-1 bg-emerald-500/10 text-emerald-400 py-2 rounded-xl text-xs hover:bg-emerald-500/20">+500</button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {Object.keys(players).length === 0 && (
          <div className="text-center py-20 text-slate-500">
            <p>ยังไม่มีผู้เล่นในวง</p>
            <p className="text-sm">เพิ่มชื่อเพื่อนเพื่อเริ่มบันทึก Chip</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PokerApp;
