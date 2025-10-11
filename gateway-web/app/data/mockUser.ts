export const mockUser = {
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
      memo: null,
      tag: null,
    },
    {
      chainId: "42161",
      chainName: "Arbitrum",
      address: "0xfedc...ba98",
      memo: null,
      tag: null,
    },
  ],
};
