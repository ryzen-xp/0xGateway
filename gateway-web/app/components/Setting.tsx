"use client";
import React, { useEffect, useState } from "react";
import { Settings, X, AlertCircle, CheckCircle, Loader } from "lucide-react";
import { useStarknetContract } from "../hooks/useStarknetContract";
import { useStarknetWallet } from "../hooks/useStarknetWallet";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  username: string;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  username,
}) => {
  const [newAddress, setNewAddress] = useState("");
  const [isActive, setIsActive] = useState<boolean>();
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [error, setError] = useState("");

  const {
    changeUserAddress,
    deactivateAccount,
    reactivateAccount,
    loading,
    isAccountActive,
  } = useStarknetContract();
  const { account } = useStarknetWallet();

  // ✅ Proper useEffect for async check
  useEffect(() => {
    if (!isOpen || !username) return;

    const checkAccountStatus = async () => {
      try {
        const active = await isAccountActive(username);
        setIsActive(active);
      } catch (err) {
        console.error("Failed to check account status:", err);
        setError("Failed to check account status. Try again later.");
      }
    };

    checkAccountStatus();
  }, [isOpen, username, isAccountActive]);

  const handleChangeAddress = async () => {
    if (!account) {
      setError("Please connect to wallet.");
      return;
    }

    if (!newAddress || !newAddress.startsWith("0x") || newAddress.length < 10) {
      setError("Please enter a valid Starknet address.");
      return;
    }

    setError("");
    const result = await changeUserAddress(account, newAddress);

    if (result?.success) {
      setSuccessMessage("Address updated successfully!");
      setShowSuccess(true);
      setNewAddress("");
      setTimeout(() => setShowSuccess(false), 3000);
    } else {
      setError(result?.error || "Failed to update address.");
    }
  };

  const handleToggleAccount = async () => {
    if (!account) {
      setError("Please connect to wallet.");
      return;
    }

    setError("");
    const result = isActive
      ? await deactivateAccount(account)
      : await reactivateAccount(account);

    if (result) {
      setIsActive(!isActive);
      setSuccessMessage(
        isActive
          ? "Account deactivated successfully!"
          : "Account reactivated successfully!"
      );
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } else {
      setError(result?.error || "Failed to update account status.");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-gray-900 to-black border border-white/10 rounded-2xl max-w-md w-full shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center">
              <Settings className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Account Settings</h2>
              <p className="text-sm text-gray-400">@{username}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          {showSuccess && (
            <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4 flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <p className="text-green-400 text-sm">{successMessage}</p>
            </div>
          )}

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-500" />
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          {/* Address Update Section */}
          <div>
            <label className="text-sm text-gray-400 mb-2 block">
              New Starknet Address
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={newAddress}
                onChange={(e) => setNewAddress(e.target.value)}
                placeholder="0x..."
                className="flex-1 bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-colors font-mono text-sm"
                disabled={loading}
              />
              <button
                onClick={handleChangeAddress}
                disabled={loading || !newAddress}
                className="px-6 py-3 bg-purple-600 hover:bg-purple-500 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg transition-all font-medium flex items-center gap-2"
              >
                {loading ? (
                  <Loader className="w-4 h-4 animate-spin" />
                ) : (
                  "Update"
                )}
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Your username will remain linked to the new address.
            </p>
          </div>

          {/* Account Status Section */}
          <div className="bg-white/5 rounded-lg p-4 border border-white/10">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-white font-medium">Account Status</h3>
                <p className="text-sm text-gray-400 mt-1">
                  {isActive
                    ? "Your account is currently active."
                    : "Your account is currently deactivated."}
                </p>
              </div>
              <div
                className={`px-3 py-1 rounded-full text-xs font-medium ${
                  isActive
                    ? "bg-green-500/20 text-green-400"
                    : "bg-red-500/20 text-red-400"
                }`}
              >
                {isActive ? "Active" : "Inactive"}
              </div>
            </div>

            <button
              onClick={handleToggleAccount}
              disabled={loading}
              className={`w-full px-4 py-3 rounded-lg transition-all font-medium flex items-center justify-center gap-2 ${
                isActive
                  ? "bg-red-600/20 hover:bg-red-600/30 text-red-400 border border-red-500/20"
                  : "bg-green-600/20 hover:bg-green-600/30 text-green-400 border border-green-500/20"
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {loading ? (
                <>
                  <Loader className="w-4 h-4 animate-spin" />
                  Processing...
                </>
              ) : isActive ? (
                "Deactivate Account"
              ) : (
                "Reactivate Account"
              )}
            </button>

            <p className="text-xs text-gray-500 mt-2">
              {isActive
                ? "Deactivating will temporarily disable your username."
                : "Reactivating will restore your username functionality."}
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-white/10">
          <button
            onClick={onClose}
            className="w-full px-4 py-3 bg-white/5 hover:bg-white/10 text-white rounded-lg transition-all font-medium"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
