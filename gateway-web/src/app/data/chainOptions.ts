export interface ChainOption {
  id: string;
  name: string;
  icon: string;
}

export const chainOptions: ChainOption[] = [
  { id: "1", name: "Ethereum", icon: "⟠" },
  { id: "137", name: "Polygon", icon: "◆" },
  { id: "42161", name: "Arbitrum", icon: "◉" },
  { id: "10", name: "Optimism", icon: "○" },
  { id: "56", name: "BSC", icon: "◈" },
  { id: "43114", name: "Avalanche", icon: "▲" },
];
