"use client";
import React, { useState } from "react";
import {
  Wallet,
  PlusCircle,
  Trash2,
  Copy,
  Check,
  Network,
  Globe,
} from "lucide-react";
import { User } from "../data/mockUser";
import { chainOptions } from "../data/chainOptions";

interface DashboardPageProps {
  user: User;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  user,
  setUser,
}) => {
  const [newWallet, setNewWallet] = useState({
    chainId: "",
    address: "",
    memo: "",
    tag: "",
  });
  const [copied, setCopied] = useState<string | null>(null);

  const handleAddWallet = () => {
    if (!newWallet.address || !newWallet.chainId) return;
    const selectedChain = chainOptions.find((c) => c.id === newWallet.chainId);
    if (!selectedChain) return;

    const updatedUser = {
      ...user,
      wallets: [
        ...user.wallets,
        {
          chainId: newWallet.chainId,
          chainName: selectedChain.name,
          address: newWallet.address,
          memo: newWallet.memo || undefined,
          tag: newWallet.tag || undefined,
        },
      ],
    };

    setUser(updatedUser);
    setNewWallet({ chainId: "", address: "", memo: "", tag: "" });
  };

  const handleRemoveWallet = (address: string) => {
    const updatedUser = {
      ...user,
      wallets: user.wallets.filter((w) => w.address !== address),
    };
    setUser(updatedUser);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(text);
    setTimeout(() => setCopied(null), 1500);
  };

  return (
    <div className="space-y-12 py-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-white">
          Welcome, {user.username}
        </h1>
        <p className="text-gray-400 mt-2">Manage your linked wallets here.</p>
      </div>

      {/* Wallets List */}
      <div className="max-w-4xl mx-auto space-y-6">
        {user.wallets.map((wallet) => (
          <div
            key={wallet.address}
            className="bg-white/5 border border-white/10 rounded-xl p-5 flex items-center justify-between hover:border-purple-500/30 transition-all"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl flex items-center justify-center">
                <Wallet className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">
                  {wallet.chainName}
                </h3>
                <p
                  className="text-sm text-gray-400 cursor-pointer hover:text-purple-300"
                  onClick={() => copyToClipboard(wallet.address)}
                >
                  {wallet.address}
                </p>
                {copied === wallet.address && (
                  <p className="text-xs text-green-400 flex items-center gap-1">
                    <Check className="w-3 h-3" /> Copied!
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-4">
              {wallet.memo && (
                <div className="text-sm text-gray-400 flex items-center gap-2">
                  <Network className="w-4 h-4" /> Memo: {wallet.memo}
                </div>
              )}
              {wallet.tag && (
                <div className="text-sm text-gray-400 flex items-center gap-2">
                  <Globe className="w-4 h-4" /> Tag: {wallet.tag}
                </div>
              )}
              <button
                onClick={() => handleRemoveWallet(wallet.address)}
                className="text-red-400 hover:text-red-300 transition-all"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        ))}

        {/* Add Wallet Section */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-6 mt-8">
          <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
            <PlusCircle className="w-5 h-5 text-purple-400" /> Add New Wallet
          </h3>
          <div className="grid md:grid-cols-4 gap-4">
            <select
              value={newWallet.chainId}
              onChange={(e) =>
                setNewWallet({ ...newWallet, chainId: e.target.value })
              }
              className="px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white"
            >
              <option value="">Select Chain</option>
              {chainOptions.map((chain) => (
                <option key={chain.id} value={chain.id}>
                  {chain.name}
                </option>
              ))}
            </select>

            <input
              type="text"
              placeholder="Wallet Address"
              value={newWallet.address}
              onChange={(e) =>
                setNewWallet({ ...newWallet, address: e.target.value })
              }
              className="px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white"
            />

            <input
              type="text"
              placeholder="Memo (optional)"
              value={newWallet.memo}
              onChange={(e) =>
                setNewWallet({ ...newWallet, memo: e.target.value })
              }
              className="px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white"
            />

            <button
              onClick={handleAddWallet}
              className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:scale-105 transition-all rounded-lg text-white font-semibold flex items-center justify-center"
            >
              Add
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
