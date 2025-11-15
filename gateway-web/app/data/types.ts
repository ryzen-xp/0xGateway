export interface Wallet {
  chainSymbol: string; 
  address: string; 
  memo?: number; 
  tag?: number; 
  metadata?: string; 
  updatedAt: number; 
}

export interface ContractWallet {
  chain_symbol: string;
  address: string;
  memo?: number;
  tag?: number;
  metadata?: string;
  updated_at: number;
}