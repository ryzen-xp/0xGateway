"use client";

import React, { useEffect, useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import {
  Wallet as WalletIcon,
  PlusCircle,
  Trash2,
  Copy,
  Check,
  Network,
  Globe,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { chainOptions } from "../data/chainOptions";
import { Wallet, ContractWallet } from "../data/types";
import { useStarknetWallet } from "../hooks/useStarknetWallet";
import { useStarknetContract } from "../hooks/useStarknetContract";

interface DashboardPageProps {
  username: string;
}

type WalletUI = Wallet & {
  chainName?: string;
};

export const DashboardPage: React.FC<DashboardPageProps> = ({ username }) => {
  const { account, isConnected } = useStarknetWallet();
  const { getUserWallets, addWallet, removeWallet } = useStarknetContract();

  const [wallets, setWallets] = useState<WalletUI[]>([]);
  const [isLoadingWallets, setIsLoadingWallets] = useState<boolean>(true);
  const [isAddingWallet, setIsAddingWallet] = useState<boolean>(false);
  const [removingAddress, setRemovingAddress] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  // Form state for adding new wallet
  const [newWalletForm, setNewWalletForm] = useState({
    chainId: "",
    address: "",
    memo: "",
    tag: "",
    metadata: "",
  });

  const getChainName = (symbol: string | undefined) =>
    chainOptions.find(
      (c) => c.symbol.toLowerCase() === (symbol || "").toLowerCase()
    )?.name ??
    symbol ??
    "Unknown";

  // Fetch wallets for username
  useEffect(() => {
    let mounted = true;
    const fetchWallets = async () => {
      if (!username) {
        setWallets([]);
        setIsLoadingWallets(false);
        return;
      }

      setIsLoadingWallets(true);
      setError(null);

      try {
        const raw: ContractWallet[] = await getUserWallets(username);

        const formatted: WalletUI[] = raw.map((w) => ({
          chainSymbol: w.chain_symbol,
          address: w.address,
          memo: w.memo,
          tag: w.tag,
          metadata: w.metadata,
          updatedAt: w.updated_at,
          chainName: getChainName(w.chain_symbol),
        }));

        if (mounted) setWallets(formatted);
      } catch (err) {
        console.error("Failed to fetch wallets:", err);
        if (mounted) setError("Failed to fetch wallets. Please try again.");
        toast.error("Failed to fetch wallets.");
      } finally {
        if (mounted) setIsLoadingWallets(false);
      }
    };

    fetchWallets();
    return () => {
      mounted = false;
    };
  }, [username, getUserWallets]);

  // Copy to clipboard
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(text);
    toast.success("Copied");
    setTimeout(() => setCopied(null), 1500);
  };

  // Add wallet (UI + contract)
  const handleAddWallet = async () => {
    const { chainId, address, memo, tag, metadata } = newWalletForm;
    if (!chainId || !address) {
      toast.error("Please select chain and enter wallet address.");
      return;
    }
    if (!isConnected || !account) {
      toast.error("Please connect your wallet to add linked wallets.");
      return;
    }

    const selected = chainOptions.find((c) => c.id === chainId);
    if (!selected) {
      toast.error("Selected chain not found.");

      return;
    }

    setIsAddingWallet(true);
    setError(null);

    try {
      await addWallet(
        account,
        selected.symbol,
        address,
        memo ? Number(memo) : undefined,
        tag ? Number(tag) : undefined,
        metadata || undefined
      );

      const newEntry: WalletUI = {
        chainSymbol: selected.symbol,
        address,
        memo: memo ? Number(memo) : undefined,
        tag: tag ? Number(tag) : undefined,
        metadata: metadata || undefined,
        updatedAt: Date.now(),
        chainName: selected.name,
      };

      setWallets((prev) => [...prev, newEntry]);
      setNewWalletForm({
        chainId: "",
        address: "",
        memo: "",
        tag: "",
        metadata: "",
      });
      toast.success("Wallet added successfully!");
    } catch (err) {
      console.error("Add wallet failed:", err);
      setError("Failed to add wallet. See console for details.");
      toast.error("Failed to add wallet.");
    } finally {
      setIsAddingWallet(false);
    }
  };

  // Remove wallet (UI + contract)
  const handleRemoveWallet = async (addressToRemove: string) => {
    if (!isConnected || !account) {
      toast.error("Please connect your wallet to remove linked wallets.");
      return;
    }

    const found = wallets.find((w) => w.address === addressToRemove);
    if (!found) return;

    const selectedChain = chainOptions.find(
      (c) => c.symbol.toLowerCase() === found.chainSymbol.toLowerCase()
    );
    if (!selectedChain) return;

    const confirmed = confirm(
      `Remove wallet ${addressToRemove} on ${found.chainName}?`
    );
    if (!confirmed) return;

    setRemovingAddress(addressToRemove);
    setError(null);

    try {
      await removeWallet(account, found.chainSymbol);

      setWallets((prev) => prev.filter((w) => w.address !== addressToRemove));

      toast.success(`Removed from ${found.chainName}`);
    } catch (err) {
      console.error("Remove wallet failed:", err);
      const errorMsg =
        err instanceof Error ? err.message : "Failed to remove wallet";
      setError(errorMsg);
      toast.error(`Failed to remove wallet: ${errorMsg}`);
    } finally {
      setRemovingAddress(null);
    }
  };

  // Loading skeleton
  if (isLoadingWallets) {
    return (
      <div className="flex items-center justify-center min-h-[320px]">
        <div className="text-center space-y-4">
          <Loader2 className="w-12 h-12 animate-spin text-purple-400 mx-auto" />
          <p className="text-gray-300">Loading your wallets...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-10 py-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-4xl font-bold text-white">Welcome, @{username}</h1>
        <p className="text-gray-400 mt-2">
          Manage your linked wallets across chains.
        </p>
        <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-purple-500/10 border border-purple-500/20 rounded-full">
          <WalletIcon className="w-4 h-4 text-purple-400" />
          <span className="text-purple-300 text-sm">
            {wallets.length} Wallet{wallets.length !== 1 ? "s" : ""} Linked
          </span>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="max-w-4xl mx-auto p-4 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-400" />
          <p className="text-red-300 text-sm">{error}</p>
        </div>
      )}

      {/* Wallets list */}
      <div className="max-w-4xl mx-auto space-y-6">
        {wallets.length === 0 ? (
          <div className="bg-white/5 border border-white/10 rounded-xl p-12 text-center">
            <WalletIcon className="w-16 h-16 text-gray-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">
              No Wallets Yet
            </h3>
            <p className="text-gray-400">
              Add your first wallet to start managing your multi-chain identity.
            </p>
          </div>
        ) : (
          wallets.map((w) => (
            <div
              key={w.address}
              className="bg-white/5 border border-white/10 rounded-xl p-5 hover:border-purple-500/30 transition-all"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl flex items-center justify-center">
                    <WalletIcon className="w-6 h-6 text-white" />
                  </div>

                  <div className="min-w-0">
                    <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                      {w.chainName}
                      <span className="text-xs bg-purple-500/20 text-purple-300 px-2 py-1 rounded">
                        {w.chainSymbol}
                      </span>
                    </h3>

                    <p
                      className="text-sm text-gray-400 cursor-pointer hover:text-purple-300 transition-colors flex items-center gap-2 truncate max-w-[480px]"
                      onClick={() => copyToClipboard(w.address)}
                    >
                      {w.address.length > 24
                        ? `${w.address.substring(0, 12)}...${w.address.slice(
                            -10
                          )}`
                        : w.address}
                      <Copy className="w-3 h-3" />
                    </p>

                    {copied === w.address && (
                      <p className="text-xs text-green-400 flex items-center gap-1 mt-1">
                        <Check className="w-3 h-3" /> Copied!
                      </p>
                    )}

                    <div className="mt-2 flex items-center gap-3 text-sm text-gray-400">
                      {w.memo !== undefined && (
                        <div className="flex items-center gap-2">
                          <Network className="w-4 h-4" />
                          <span>Memo: {w.memo}</span>
                        </div>
                      )}

                      {w.tag !== undefined && (
                        <div className="flex items-center gap-2">
                          <Globe className="w-4 h-4" />
                          <span>Tag: {w.tag}</span>
                        </div>
                      )}

                      {w.metadata && (
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-300 italic">
                            {w.metadata}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <button
                    onClick={() => handleRemoveWallet(w.address)}
                    disabled={removingAddress === w.address}
                    className="text-red-400 hover:text-red-300 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    aria-label={`Remove wallet ${w.address}`}
                  >
                    {removingAddress === w.address ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <Trash2 className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))
        )}

        {/* Add wallet form */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-6 mt-6">
          <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
            <PlusCircle className="w-5 h-5 text-purple-400" />
            Add New Wallet
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 items-end">
            <select
              value={newWalletForm.chainId}
              onChange={(e) =>
                setNewWalletForm({ ...newWalletForm, chainId: e.target.value })
              }
              className="px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:outline-none"
              disabled={isAddingWallet}
            >
              <option value="" className="bg-gray-900 text-white">
                Select Chain
              </option>
              {chainOptions.map((c) => (
                <option
                  key={c.id}
                  value={c.id}
                  className="bg-gray-900 text-white"
                >
                  {c.name} ({c.symbol})
                </option>
              ))}
            </select>

            <input
              type="text"
              placeholder="Wallet Address"
              value={newWalletForm.address}
              onChange={(e) =>
                setNewWalletForm({ ...newWalletForm, address: e.target.value })
              }
              className="px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:outline-none"
              disabled={isAddingWallet}
            />

            <input
              type="text"
              placeholder="Memo (optional)"
              value={newWalletForm.memo}
              onChange={(e) =>
                setNewWalletForm({ ...newWalletForm, memo: e.target.value })
              }
              className="px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:outline-none"
              disabled={isAddingWallet}
            />

            <input
              type="text"
              placeholder="Tag (optional)"
              value={newWalletForm.tag}
              onChange={(e) =>
                setNewWalletForm({ ...newWalletForm, tag: e.target.value })
              }
              className="px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:outline-none"
              disabled={isAddingWallet}
            />

            <input
              type="text"
              placeholder="Metadata (optional)"
              value={newWalletForm.metadata}
              onChange={(e) =>
                setNewWalletForm({ ...newWalletForm, metadata: e.target.value })
              }
              className="px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:outline-none"
              disabled={isAddingWallet}
            />

            {/* On small screens, show add button below inputs; on wide, it's in-grid */}
            <div className="col-span-full md:col-auto lg:col-auto">
              <button
                onClick={handleAddWallet}
                disabled={
                  isAddingWallet ||
                  !newWalletForm.chainId ||
                  !newWalletForm.address
                }
                className="w-full md:w-auto px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 disabled:from-gray-600 disabled:to-gray-600 disabled:cursor-not-allowed rounded-lg text-white font-semibold transition-all flex items-center justify-center gap-2"
              >
                {isAddingWallet ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Adding...
                  </>
                ) : (
                  <>
                    <PlusCircle className="w-4 h-4" />
                    Add Wallet
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
