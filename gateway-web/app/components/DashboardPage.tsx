"use client";

import React, { useEffect, useState } from "react";
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
import { Wallet as WalletType } from "../data/types";
import { useStarknetWallet } from "../hooks/useStarknetWallet";
import { useStarknetContract } from "../hooks/useStarknetContract";

interface DashboardPageProps {
  username: string;
}

type WalletUI = WalletType & {
  chainName?: string;
};

export const DashboardPage: React.FC<DashboardPageProps> = ({ username }) => {
  const { account, isConnected } = useStarknetWallet();
  const { getWalletsForUser, addWalletToUser, removeWalletFromUser } =
    useStarknetContract();

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
        // TODO: Replace the following placeholder call with your contract read call.
        // Example if your contract has `get_wallets(username)`:
        // const raw = await getWalletsForUser(username);
        //
        // For now we handle two cases:
        // - If getWalletsForUser exists, call it
        // - If not, treat as no wallets (empty array)
        let raw: any[] = [];
        if (typeof getWalletsForUser === "function") {
          raw = await getWalletsForUser(username);
        } else {
          // placeholder: empty result (no wallets)
          raw = [];
        }

        // raw is expected to be an array of on-chain wallet objects
        // we normalize them to WalletUI
        const formatted: WalletUI[] = (raw || []).map((w: any) => {
          // fields depend on ABI; handle common cases robustly
          const chainSymbol =
            w.chain_symbol?.toString?.() ??
            w.chainSymbol?.toString?.() ??
            w.chain?.toString?.() ??
            "";
          const address = w.address?.toString?.() ?? w.addr?.toString?.() ?? "";
          const memoRaw = w.memo ?? w.memo_u128 ?? null;
          const tagRaw = w.tag ?? w.tag_u128 ?? null;
          const metadataRaw =
            w.metadata?.toString?.() ?? w.meta?.toString?.() ?? null;
          const updatedAtRaw = w.updated_at ?? w.updatedAt ?? Date.now();

          const ui: WalletUI = {
            chainSymbol: chainSymbol,
            address: address,
            memo:
              memoRaw !== null && memoRaw !== undefined
                ? Number(memoRaw)
                : undefined,
            tag:
              tagRaw !== null && tagRaw !== undefined
                ? Number(tagRaw)
                : undefined,
            metadata: metadataRaw ?? undefined,
            updatedAt: Number(updatedAtRaw),
            chainName: getChainName(chainSymbol),
          };

          return ui;
        });

        if (mounted) {
          setWallets(formatted);
        }
      } catch (err) {
        console.error("Failed to fetch wallets:", err);
        if (mounted) setError("Failed to fetch wallets. Please try again.");
      } finally {
        if (mounted) setIsLoadingWallets(false);
      }
    };

    fetchWallets();

    return () => {
      mounted = false;
    };
  }, [username, getWalletsForUser]);

  // Copy to clipboard
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(text);
    setTimeout(() => setCopied(null), 1500);
  };

  // Add wallet (UI + contract)
  const handleAddWallet = async () => {
    const { chainId, address, memo, tag, metadata } = newWalletForm;
    if (!chainId || !address) {
      alert("Please select chain and enter wallet address.");
      return;
    }
    if (!isConnected || !account) {
      alert("Please connect your wallet to add linked wallets.");
      return;
    }

    const selected = chainOptions.find((c) => c.id === chainId);
    if (!selected) {
      alert("Selected chain not found.");
      return;
    }

    setIsAddingWallet(true);
    setError(null);

    try {
      // TODO: Replace with actual contract write call using signer
      // Example:
      // const tx = await addWalletToUser({
      //   owner: account,
      //   chainSymbol: selected.symbol,
      //   address,
      //   memo: memo ? BigInt(memo) : undefined,
      //   tag: tag ? BigInt(tag) : undefined,
      //   metadata: metadata || undefined
      // });
      // await waitForTx(tx);

      // For now update local state optimistically
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
      alert("Wallet added (UI-only). Replace placeholder with on-chain call.");
    } catch (err) {
      console.error("Add wallet failed:", err);
      setError("Failed to add wallet. See console for details.");
    } finally {
      setIsAddingWallet(false);
    }
  };

  // Remove wallet (UI + contract)
  const handleRemoveWallet = async (addressToRemove: string) => {
    if (!isConnected || !account) {
      alert("Please connect your wallet to remove linked wallets.");
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
      // TODO: Replace with actual contract remove call
      // const tx = await removeWalletFromUser({ owner: account, chainSymbol: found.chainSymbol, address: addressToRemove });
      // await waitForTx(tx);

      // Update local state
      setWallets((prev) => prev.filter((w) => w.address !== addressToRemove));
      alert(
        "Wallet removed (UI-only). Replace placeholder with on-chain call."
      );
    } catch (err) {
      console.error("Remove wallet failed:", err);
      setError("Failed to remove wallet. See console for details.");
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
