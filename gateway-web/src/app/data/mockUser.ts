export interface Wallet {
  chainId: string;
  chainName: string;
  address: string;
  memo?: string | null;
  tag?: string | null;
}

export interface User {
  username: string;
  address: string;
  active: boolean;
  wallets: Wallet[];
}

export const mockUser: User = {
  username: "alice.stark",
  address: "0x1234...5678",
  active: true,
  wallets: [
    {
      chainId: "1",
      chainName: "Ethereum",
      address: "0xabcd...efgh",
      memo: "12345",
      tag: "67890",
    },
    {
      chainId: "137",
      chainName: "Polygon",
      address: "0x9876...5432",
    },
    {
      chainId: "42161",
      chainName: "Arbitrum",
      address: "0xfedc...ba98",
    },
  ],
};
