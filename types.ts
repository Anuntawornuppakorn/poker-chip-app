
export interface Player {
  id: string;
  name: string;
  buyIn: number;
  cashOut: number;
  transactions: Transaction[];
}

export interface Transaction {
  id: string;
  type: 'buy-in' | 'cash-out';
  amount: number;
  timestamp: number;
}

export interface Settlement {
  from: string;
  to: string;
  amount: number;
}

export interface GameSession {
  id: string;
  date: number;
  players: Player[];
  totalBuyIn: number;
  totalCashOut: number;
  totalFees: number;
}
