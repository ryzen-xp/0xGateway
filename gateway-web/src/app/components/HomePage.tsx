"use client";
import React, { useState } from "react";
import {
  Shield,
  ArrowRight,
  Search,
  User,
  CheckCircle,
  XCircle,
  Wallet,
  Link,
} from "lucide-react";
import { FeatureCard } from "./FeatureCard";

interface HomePageProps {
  onConnect: () => void;
  searchQuery: string;
  setSearchQuery: (val: string) => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  onConnect,
  searchQuery,
  setSearchQuery,
}) => {
  const [searchResult, setSearchResult] = useState<any>(null);

  const handleSearch = () => {
    if (searchQuery.trim()) {
      setSearchResult({
        username: searchQuery,
        address: "0x" + Math.random().toString(16).substring(2, 10) + "...",
        active: true,
        walletsCount: Math.floor(Math.random() * 5) + 1,
      });
    }
  };

  return (
    <div className="space-y-16">
      {/* Hero Section */}
      <div className="text-center space-y-8 pt-12">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-500/10 border border-purple-500/20 rounded-full text-purple-300 text-sm">
          <Shield className="w-4 h-4" />
          Powered by Starknet
        </div>

        <h1 className="text-6xl font-bold text-white leading-tight">
          One Username,
          <br />
          <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            All Your Wallets
          </span>
        </h1>

        <p className="text-xl text-gray-300 max-w-2xl mx-auto">
          Register a universal username and link all your crypto wallets across
          different blockchains.
        </p>

        <div className="flex items-center justify-center gap-4 pt-4">
          <button
            onClick={onConnect}
            className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-xl transition-all transform hover:scale-105 shadow-xl"
          >
            Get Started <ArrowRight className="w-5 h-5" />
          </button>
          <button className="px-8 py-4 bg-white/5 hover:bg-white/10 text-white font-semibold rounded-xl border border-white/10">
            Learn More
          </button>
        </div>
      </div>

      {/* Search Section */}
      <div className="max-w-2xl mx-auto">
        <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-8 border border-white/10 shadow-2xl">
          <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
            <Search className="w-6 h-6 text-purple-400" /> Search Username
          </h2>
          <div className="flex gap-3">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              placeholder="Enter username..."
              className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500"
            />
            <button
              onClick={handleSearch}
              className="px-6 py-3 bg-purple-600 hover:bg-purple-500 text-white font-semibold rounded-lg"
            >
              Search
            </button>
          </div>
          {searchResult && (
            <div className="mt-6 p-4 bg-white/5 rounded-lg border border-white/10">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                    <User className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">
                      {searchResult.username}
                    </h3>
                    <p className="text-sm text-gray-400">
                      {searchResult.address}
                    </p>
                  </div>
                </div>
                {searchResult.active ? (
                  <CheckCircle className="w-6 h-6 text-green-400" />
                ) : (
                  <XCircle className="w-6 h-6 text-red-400" />
                )}
              </div>
              <div className="flex items-center gap-4 text-sm text-gray-300">
                <span className="flex items-center gap-1">
                  <Wallet className="w-4 h-4" />
                  {searchResult.walletsCount} wallets
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Features */}
      <div className="grid md:grid-cols-3 gap-8 pt-8">
        <FeatureCard
          icon={<User className="w-8 h-8" />}
          title="Universal Username"
          description="One username for all chains"
        />
        <FeatureCard
          icon={<Link className="w-8 h-8" />}
          title="Multi-Chain Support"
          description="Link Ethereum, Polygon, and more"
        />
        <FeatureCard
          icon={<Shield className="w-8 h-8" />}
          title="Secure & Decentralized"
          description="Built on Starknet"
        />
      </div>
    </div>
  );
};
