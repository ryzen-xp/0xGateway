export interface ChainOption {
  id: string;
  name: string;
  symbol: string;
  icon?: string;
}

export const chainOptions: ChainOption[] = [
  {
    id: "ethereum",
    name: "Ethereum",
    symbol: "ETH",
  },
  {
    id: "starknet",
    name: "Starknet",
    symbol: "STRK",
  },
  {
    id: "polygon",
    name: "Polygon",
    symbol: "MATIC",
  },
  {
    id: "arbitrum",
    name: "Arbitrum",
    symbol: "ARB",
  },
  {
    id: "optimism",
    name: "Optimism",
    symbol: "OP",
  },
  {
    id: "base",
    name: "Base",
    symbol: "BASE",
  },
  {
    id: "avalanche",
    name: "Avalanche",
    symbol: "AVAX",
  },
  {
    id: "bsc",
    name: "BNB Chain",
    symbol: "BNB",
  },
  {
    id: "solana",
    name: "Solana",
    symbol: "SOL",
  },
  {
    id: "cosmos",
    name: "Cosmos",
    symbol: "ATOM",
  },
  {
    id: "bitcoin",
    name: "Bitcoin",
    symbol: "BTC",
  },
  {
    id: "stellar",
    name: "Stellar",
    symbol: "XLM",
  },
];
