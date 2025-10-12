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
  Loader2,
} from "lucide-react";
import { FeatureCard } from "./FeatureCard";
import { useStarknetContract } from "../hooks/useStarknetContract";
import { useStarknetWallet } from "../hooks/useStarknetWallet";

interface SearchResult {
  username: string;
  available: boolean;
  userInfo?: {
    address: string;
    active: boolean;
  };
}

export const HomePage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [searchResult, setSearchResult] = useState<SearchResult | null>(null);
  const [isRegistering, setIsRegistering] = useState(false);

  const { loading, error, checkUsernameAvailability, registerUsername } =
    useStarknetContract();
  const { handleConnect, account, isConnected } = useStarknetWallet();

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      alert("Please enter a username");
      return;
    }

    try {
      const result = await checkUsernameAvailability(searchQuery);

      if (result.available) {
        setSearchResult({
          username: searchQuery,
          available: true,
        });
      } else {

        setSearchResult({
          username: searchQuery,
          available: false,
          userInfo: {
            address: result.userInfo?.user_address || "",
            active: result.userInfo?.active || false,
          },
        });
      }
    } catch (err) {
      console.error("Error checking username:", err);
      alert("Failed to check username. Please try again.");
    }
  };

  const handleRegister = async () => {
    if (!isConnected) {
      alert("Please connect your wallet first");
      handleConnect();
      return;
    }

    if (!account) {
      alert("No account found. Please connect your wallet.");
      return;
    }

    if (!searchQuery.trim()) {
      alert("Please enter a username");
      return;
    }

    setIsRegistering(true);
    try {
      await registerUsername(searchQuery, account);
      alert(`Username @${searchQuery} registered successfully! 🎉`);
      setSearchResult(null);
      setSearchQuery("");
      window.location.reload();
    } catch (err) {
      console.error("Error registering username:", err);
      alert(
        "Failed to register username OR Already Have yo register. Please try again."
      );
    } finally {
      setIsRegistering(false);
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
            onClick={handleConnect}
            className="flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-xl transition-all transform hover:scale-105 shadow-xl"
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
          <h3 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
            <Search className="w-6 h-6 text-purple-400" />
            Check Username Availability
          </h3>

          <div className="flex gap-3">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              placeholder="Enter username..."
              className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:outline-none"
              disabled={loading || isRegistering}
            />

            {!searchResult?.available ? (
              <button
                onClick={handleSearch}
                disabled={loading || !searchQuery.trim()}
                className="px-6 py-3 bg-purple-600 hover:bg-purple-500 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Checking...
                  </>
                ) : (
                  "Search"
                )}
              </button>
            ) : (
              <button
                onClick={handleRegister}
                disabled={isRegistering || !isConnected}
                className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 disabled:from-gray-600 disabled:to-gray-600 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-all flex items-center gap-2"
              >
                {isRegistering ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Registering...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    Register
                  </>
                )}
              </button>
            )}
          </div>

          {/* Error Display */}
          {error && (
            <div className="mt-4 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
              <p className="text-red-300 text-sm">⚠️ {error}</p>
            </div>
          )}

          {/* Search Results */}
          {searchResult && (
            <div className="mt-6 p-6 bg-white/5 rounded-lg border border-white/10">
              {searchResult.available ? (
                // Username is AVAILABLE
                <div className="text-center space-y-4">
                  <div className="flex items-center justify-center">
                    <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center">
                      <CheckCircle className="w-10 h-10 text-green-400" />
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold text-white">
                    @{searchResult.username} is available! 🎉
                  </h3>
                  <p className="text-gray-300">
                    This username is free and ready to be registered.
                  </p>

                  {!isConnected && (
                    <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                      <p className="text-yellow-300 text-sm">
                        💡 Connect your wallet to register this username
                      </p>
                    </div>
                  )}

                  <div className="flex items-center justify-center gap-3 pt-2">
                    <button
                      onClick={() => {
                        setSearchResult(null);
                        setSearchQuery("");
                      }}
                      className="px-4 py-2 bg-white/5 hover:bg-white/10 text-gray-300 rounded-lg transition-colors"
                    >
                      Try Another
                    </button>
                  </div>
                </div>
              ) : (
                // Username is TAKEN
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-pink-500 rounded-full flex items-center justify-center">
                        <User className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-white">
                          @{searchResult.username}
                        </h3>
                        <p className="text-sm text-gray-400">
                          {searchResult.userInfo?.address.substring(0, 10)}...
                          {searchResult.userInfo?.address.substring(
                            searchResult.userInfo.address.length - 8
                          )}
                        </p>
                      </div>
                    </div>
                    <XCircle className="w-8 h-8 text-red-400" />
                  </div>

                  <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
                    <p className="text-red-300 font-medium">
                      ⚠️ This username is already taken. Please try a different
                      one.
                    </p>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-3 py-1 rounded-full text-sm ${
                          searchResult.userInfo?.active
                            ? "bg-green-500/20 text-green-300"
                            : "bg-gray-500/20 text-gray-300"
                        }`}
                      >
                        {searchResult.userInfo?.active ? "Active" : "Inactive"}
                      </span>
                    </div>

                    <button
                      onClick={() => {
                        setSearchResult(null);
                        setSearchQuery("");
                      }}
                      className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg transition-colors text-sm"
                    >
                      Try Another Username
                    </button>
                  </div>
                </div>
              )}
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
