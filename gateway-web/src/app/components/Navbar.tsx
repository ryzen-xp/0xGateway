"use client";
import React from "react";
import { Globe, Home, Settings, LogOut, User } from "lucide-react";
import { User as UserType } from "../data/mockUser";

interface NavbarProps {
  isConnected: boolean;
  user: UserType | null;
  currentPage: string;
  setCurrentPage: (page: string) => void;
  onConnect: () => void;
  onDisconnect: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  isConnected,
  user,
  currentPage,
  setCurrentPage,
  onConnect,
  onDisconnect,
}) => {
  return (
    <nav className="bg-black/30 backdrop-blur-xl border-b border-white/10">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
            <Globe className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Starknet Gateway</h1>
            <p className="text-xs text-purple-300">Universal Username System</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {isConnected ? (
            <>
              <button
                onClick={() => setCurrentPage("home")}
                className={`px-4 py-2 rounded-lg transition-all ${
                  currentPage === "home"
                    ? "bg-purple-600 text-white"
                    : "text-gray-300 hover:bg-white/5"
                }`}
              >
                <Home className="w-5 h-5" />
              </button>
              <button
                onClick={() => setCurrentPage("dashboard")}
                className={`px-4 py-2 rounded-lg transition-all ${
                  currentPage === "dashboard"
                    ? "bg-purple-600 text-white"
                    : "text-gray-300 hover:bg-white/5"
                }`}
              >
                <Settings className="w-5 h-5" />
              </button>
              <div className="flex items-center gap-3 px-4 py-2 bg-white/5 rounded-lg border border-white/10">
                <User className="w-5 h-5 text-purple-400" />
                <span className="text-white font-medium">{user?.username}</span>
              </div>
              <button
                onClick={onDisconnect}
                className="px-4 py-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded-lg transition-all flex items-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                Disconnect
              </button>
            </>
          ) : (
            <button
              onClick={onConnect}
              className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-semibold rounded-lg transition-all transform hover:scale-105 shadow-lg shadow-purple-500/50"
            >
              Connect Wallet
            </button>
          )}
        </div>
      </div>
    </nav>
  );
};
