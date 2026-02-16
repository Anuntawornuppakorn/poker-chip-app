
import React, { useState } from 'react';
import { X, UserPlus } from 'lucide-react';

interface AddPlayerModalProps {
  onClose: () => void;
  onSubmit: (name: string) => void;
}

const AddPlayerModal: React.FC<AddPlayerModalProps> = ({ onClose, onSubmit }) => {
  const [name, setName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onSubmit(name.trim());
      setName('');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-950/90 backdrop-blur-sm animate-in fade-in duration-300"
        onClick={onClose}
      />
      
      {/* Content - Bottom Sheet on Mobile */}
      <div className="relative bg-slate-900 border-t sm:border border-slate-800 w-full max-w-md rounded-t-[2.5rem] sm:rounded-[2.5rem] p-8 pb-12 sm:pb-8 shadow-2xl animate-in slide-in-from-bottom sm:zoom-in duration-300">
        <div className="w-12 h-1.5 bg-slate-800 rounded-full mx-auto mb-6 sm:hidden" />
        
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-500/10 p-2.5 rounded-2xl">
              <UserPlus className="w-6 h-6 text-indigo-400" />
            </div>
            <h2 className="text-xl font-black tracking-tight text-white">New Player</h2>
          </div>
          <button onClick={onClose} className="p-2 text-slate-500 hover:text-white transition-colors">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-3 ml-1">Player Name</label>
            <input 
              autoFocus
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. John Wick"
              className="w-full bg-slate-950 border border-slate-800 rounded-[1.5rem] px-6 py-4 text-lg font-bold focus:outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all placeholder:text-slate-800"
            />
          </div>
          
          <button 
            type="submit"
            disabled={!name.trim()}
            className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-600 text-white font-black text-lg py-5 rounded-[1.5rem] transition-all active:scale-[0.97] shadow-xl shadow-indigo-500/20"
          >
            Join Table
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddPlayerModal;
