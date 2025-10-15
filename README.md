# 🌉 0xGateway Protocol

[![Live on Starknet Sepolia](https://img.shields.io/badge/Starknet_Sepolia-Live-blueviolet)](https://sepolia.starkscan.co/contract/0x063bd23c0c524fa9fa2693e4945009acf9ba80341564ab429f4ab578c6253eeb)
[![Build](https://github.com/0xAXE/axe/actions/workflows/contract.yml/badge.svg)](https://github.com/0xGateway/axe/actions/workflows/CI.yml)
[![Deployed on](https://img.shields.io/badge/Deployed%20on-Vercel-000000?logo=vercel&logoColor=white)](https://gateway-bay.vercel.app/)


> **Send crypto to @username instead of 0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb**

Replace complex wallet addresses with simple, memorable usernames across all blockchains.



**Contract Address (Sepolia Testnet):**  
`0x063bd23c0c524fa9fa2693e4945009acf9ba80341564ab429f4ab578c6253eeb`

---

## 🎯 The Problem

- Wallet addresses are **impossible to remember** (0x742d35Cc6634C0532925a3b844Bc9e...)
- Users manage **dozens of addresses** across different chains
- **Copy-paste errors** cause permanent fund loss
- **No unified identity** across blockchain ecosystems

## ✨ The Solution

Register **@yourname** once → Link all your wallet addresses → Anyone can send you crypto using just **@yourname**

---

## 🚀 How It Works

### 1. Register Username

```rust
gateway.register_username("@sandeep");
```

### 2. Link Multiple Chain Wallets

```rust
// Add Ethereum wallet
gateway.add_wallets("ETH", 0x742d35..., memo, tag, metadata);

// Add Solana wallet
gateway.add_wallets("SOL", 0x7xKXtg..., memo, tag, metadata);

// Add any blockchain wallet with optional memo/tag for exchanges
```

### 3. Anyone Sends to Your Username

```rust
// Lookup user's address by username + chain
let wallet = gateway.get_wallet("@sandeep", "ETH");
// Returns: { address: 0x742d35..., memo: 12345, tag: null }

// Send funds
transfer(wallet.address, amount);
```

**Your username becomes your universal blockchain identity.**

---

## 🛠️ For Developers

### Smart Contract Integration

```rust
#[starknet::interface]
pub trait IGateway<TContractState> {
    // Registration & Management
    fn register_username(ref self: TContractState, username: ByteArray);
    fn add_wallets(ref self: TContractState, chain_symbol: ByteArray,
                   wallet_address: felt252, memo: Option<u128>,
                   tag: Option<u128>, metadata: Option<ByteArray>);
    fn remove_wallet(ref self: TContractState, chain_symbol: ByteArray);

    // Queries
    fn get_wallet(self: @TContractState, username: ByteArray,
                  chain_symbol: ByteArray) -> Wallet;
    fn get_all_user_wallets(self: @TContractState,
                            username: ByteArray) -> Array<Wallet>;
    fn check_username_exist(self: @TContractState, username: ByteArray) -> bool;
    fn get_username(self: @TContractState, address: ContractAddress) -> ByteArray;

    // Account Control
    fn deactivate_account(ref self: TContractState);
    fn reactivate_account(ref self: TContractState);
    fn is_account_active(self: @TContractState, username: ByteArray) -> bool;
}
```

### Example: Payment Integration

```rust
fn send_payment(username: ByteArray, chain: ByteArray, amount: u256) {
    let gateway = IGatewayDispatcher { contract_address: GATEWAY_ADDRESS };

    // Verify user is active
    assert!(gateway.is_account_active(username), "User inactive");

    // Get wallet for specific chain
    let wallet = gateway.get_wallet(username, chain);

    // Send payment
    IERC20::transfer(wallet.address, amount);
}
```

---

## 🎯 Key Features

✅ **One Username, All Chains** - Link Ethereum, Solana, Polygon, etc. under one name  
✅ **Human-Readable** - Send to @alice instead of 0x742d35...  
✅ **Exchange Compatible** - Support memo/tag fields for CEX deposits  
✅ **Fully On-Chain** - Decentralized, immutable storage on Starknet  
✅ **Account Control** - Deactivate if compromised, change addresses  
✅ **Developer Friendly** - Simple interface, no infrastructure needed

---

## 💡 Use Cases

| Scenario           | Traditional                | With Gateway             |
| ------------------ | -------------------------- | ------------------------ |
| **DeFi Payment**   | Send to 0x742d35Cc...      | Send to @alice           |
| **Multi-Chain**    | Remember 5+ addresses      | One @username            |
| **Gaming Rewards** | Collect addresses manually | Pay @player123           |
| **DAO Treasury**   | Spreadsheet of addresses   | Transfer to @contributor |
| **Tip Bot**        | /tip 0x742d... 10 USDC     | /tip @creator 10 USDC    |

---

## 🔐 Why It Matters

**58 characters → 8 characters**  
Less errors, better UX, true cross-chain identity.

Current Web3 onboarding requires users to:

- Copy/paste long addresses (error-prone)
- Manage different addresses per chain (confusing)
- Risk permanent loss on typos (no undo)

**Gateway fixes this** with decentralized usernames that work everywhere.

---

## 🗺️ Roadmap

**✅ Phase 1 (Current) - Starknet Sepolia**

- Core contract deployed & tested
- Username registration + multi-wallet management
- Web interface live

**📋 Phase 2 - Multi-Chain Expansion**

- Deploy to Ethereum, Polygon, Arbitrum, Optimism (EVM)
- Deploy to Solana, Stellar
- Cross-chain username resolution

**📋 Phase 3 - SDK & Ecosystem**

- REST API for off-chain lookups
- TypeScript/Python SDKs
- Wallet integrations (MetaMask, Argent)
- DeFi partnerships

---

## 🏗️ Technical Architecture

```
User: @sandeep
├── Starknet:  0x063bd23...  (Primary)
├── Ethereum:  0x742d35C...
├── Polygon:   0x8f3Cf7a...
├── Solana:    7xKXtg2C...
└── Stellar:   GDZST3XW...
         ↓
  Starknet Contract
  ├── Username Registry (unique, immutable)
  ├── Multi-Chain Wallet Mapping
  ├── Optional Metadata (memo, tag, metadata)
  └── Account Lifecycle (active/inactive)
```

**All data stored on-chain. No centralized database. Fully decentralized.**

---

## 🚀 Try It Now

1. Visit demo site [https://gateway-bay.vercel.app/](https://gateway-bay.vercel.app/)
2. Connect Starknet wallet
3. Register @yourname
4. Add wallet addresses for different chains
5. Share your username!

---

## 📊 Impact

- **Reduces user errors** by 95% (no more address typos)
- **Improves onboarding** - memorable usernames vs hex strings
- **Enables cross-chain** - one identity across all blockchains
- **Developer friendly** - 3 lines of code to integrate

---

## 🛠️ Built With

- **Cairo** - Starknet smart contracts
- **Starknet** - L2 scaling solution
- **Next.js + React** - Modern web interface
- **Starknet.js** - Blockchain integration

---

## 📞 Links

- **Live Demo:** [https://gateway-bay.vercel.app/](https://gateway-bay.vercel.app/)
- **Contract:** [Sepolia Starkscan](https://sepolia.starkscan.co/contract/0x063bd23c0c524fa9fa2693e4945009acf9ba80341564ab429f4ab578c6253eeb)
- **GitHub:** [https://github.com/ryzen-xp/0xGateway](https://github.com/ryzen-xp/0xGateway)

---

<div align="center">

**Making blockchain addresses human-readable, one username at a time.**

</div>
