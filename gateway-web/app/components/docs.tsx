"use client";
import React from "react";
import { Shield, Link, Globe, User, Code2 } from "lucide-react";

const STARKNET_CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;

const Docs: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900  text-white py-16 px-6">
      <div className="max-w-5xl mx-auto space-y-16">
        {/* Header */}
        <div className="text-center space-y-6">
          <h1 className="text-5xl font-bold">
            <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Gateway Protocol Documentation
            </span>
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            A Starknet-based protocol that replaces complex wallet addresses
            with simple usernames — making cross-chain crypto transfers
            seamless.
          </p>
        </div>

        {/* Contract Address */}
        <section className="space-y-2 text-center">
          <a
            href={`https://sepolia.voyager.online/contract/${STARKNET_CONTRACT_ADDRESS}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 bg-purple-700/10 border border-purple-700/40 rounded-xl text-purple-300 text-sm hover:bg-purple-700/20 transition"
          >
            <Code2 className="w-4 h-4" />
            Starknet Contract:
            <span className="text-purple-200 font-mono underline">
              {STARKNET_CONTRACT_ADDRESS}
            </span>
          </a>
          <div className="text-gray-400 text-sm">
            Currently live on Starknet. Deployments for Ethereum, EVM chains,
            Solana, and Stellar are coming soon.
          </div>
        </section>

        {/* About Section */}
        <section className="space-y-4">
          <h2 className="text-3xl font-semibold flex items-center gap-2">
            <Shield className="w-7 h-7 text-purple-400" />
            What is Gateway?
          </h2>
          <p className="text-gray-300 leading-relaxed">
            Gateway is a decentralized username registry built on Starknet. It
            allows users to register unique usernames (e.g., <b>@sandeep</b>)
            that automatically link all their wallet addresses across multiple
            blockchains like Ethereum, Polygon, Starknet, and more.
          </p>
        </section>

        {/* How It Works */}
        <section className="space-y-4">
          <h2 className="text-3xl font-semibold flex items-center gap-2">
            <Link className="w-7 h-7 text-pink-400" />
            How It Works
          </h2>
          <ul className="list-disc list-inside space-y-2 text-gray-300">
            <li>Each username is mapped to a user’s main Starknet address.</li>
            <li>
              Users can add wallet addresses for other chains (ETH, MATIC,
              etc.).
            </li>
            <li>
              Anyone can send crypto to <code>@username</code> instead of long
              hex addresses.
            </li>
            <li>
              The mapping is stored on-chain and verified using Starknet
              contracts.
            </li>
          </ul>
        </section>

        {/* Integration */}
        <section className="space-y-4">
          <h2 className="text-3xl font-semibold flex items-center gap-2">
            <Globe className="w-7 h-7 text-green-400" />
            Integration for Developers
          </h2>
          <p className="text-gray-300">
            Import and use the following interface in your Starknet smart
            contract to interact with Gateway Protocol:
          </p>
          <pre className="bg-black/40 border border-white/10 rounded-xl p-6 text-sm overflow-x-auto text-gray-200">
            {`#[starknet::interface]
pub trait IGateway<TContractState> {
    fn change_user_address(ref self: TContractState, new_address: ContractAddress);
    fn deactivate_account(ref self: TContractState);
    fn reactivate_account(ref self: TContractState);
    fn is_account_active(self: @TContractState, username: ByteArray) -> bool;

    fn register_username(ref self: TContractState, username: ByteArray);
    fn check_username_exist(self: @TContractState, username: ByteArray) -> bool;
    fn add_wallets(
        ref self: TContractState,
        chain_symbol: ByteArray,
        wallet_address: felt252,
        memo: Option<u128>,
        tag: Option<u128>,
        metadata: Option<ByteArray>,
    );
    fn remove_wallet(ref self: TContractState, chain_symbol: ByteArray);

    fn get_user_info(self: @TContractState, username: ByteArray) -> UserInfo;
    fn get_username(self: @TContractState, address: ContractAddress) -> ByteArray;
    fn get_wallet(self: @TContractState, username: ByteArray, chain_symbol: ByteArray) -> Wallet;
    fn get_user_chain_symbols(self: @TContractState, username: ByteArray) -> Array<ByteArray>;
    fn get_all_user_wallets(self: @TContractState, username: ByteArray) -> Array<Wallet>;
}
`}
          </pre>
          <p className="text-gray-400">
            By integrating this interface, contracts can fetch and validate
            wallet data via username — so users never need to remember multiple
            addresses.
          </p>
        </section>

        {/* 0xGateway SDK (Off-chain) */}
        <section className="space-y-4">
          <h2 className="text-3xl font-semibold flex items-center gap-2">
            <Globe className="w-7 h-7 text-pink-400" />
            0xGateway SDK (Coming Soon)
          </h2>
          <p className="text-gray-300">
            The 0xGateway SDK will let you fetch user addresses off-chain, by
            username, using REST or GraphQL. This makes integration with
            wallets, dApps, and exchanges easy — without running a node or
            calling a smart contract.
          </p>
        </section>

        {/* L1 & Multi-Chain Features */}
        <section className="space-y-4">
          <h2 className="text-3xl font-semibold flex items-center gap-2">
            <Globe className="w-7 h-7 text-green-400" />
            Multi-Chain Support (Coming Soon)
          </h2>
          <ul className="list-disc list-inside space-y-2 text-gray-300">
            <li>
              Smart contracts on Ethereum/EVM, Solana, and Stellar will soon be
              able to call Gateway by username and fetch all chain-linked
              addresses by passing the chain symbol (e.g., <code>ETH</code>,{" "}
              <code>MATIC</code>, <code>SOL</code>, <code>XLM</code>).
            </li>
            <li>
              This feature will allow cross-chain payments and interactions,
              using a single username for all your blockchain wallets.
            </li>
          </ul>
        </section>

        {/* Benefits */}
        <section className="space-y-4">
          <h2 className="text-3xl font-semibold flex items-center gap-2">
            <User className="w-7 h-7 text-blue-400" />
            Why It’s Useful
          </h2>
          <ul className="list-disc list-inside space-y-2 text-gray-300">
            <li>No need to remember multiple wallet addresses.</li>
            <li>Works across any blockchain ecosystem.</li>
            <li>Easy to integrate into DeFi, NFT, or GameFi dApps.</li>
            <li>Decentralized identity — your username is owned on-chain.</li>
          </ul>
        </section>
      </div>
    </div>
  );
};

export default Docs;
