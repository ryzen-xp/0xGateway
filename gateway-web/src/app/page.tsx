"use client";
import React, { useState } from "react";
import { Navbar } from "./components/Navbar";
import { HomePage } from "./components/HomePage";
import { DashboardPage } from "./components/DashboardPage";
import { mockUser, User } from "./data/mockUser";

export default function App() {
  const [isConnected, setIsConnected] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [currentPage, setCurrentPage] = useState<"home" | "dashboard">("home");
  const [searchQuery, setSearchQuery] = useState("");

  const handleConnect = () => {
    setIsConnected(true);
    setUser(mockUser);
    setCurrentPage("dashboard");
  };

  const handleDisconnect = () => {
    setIsConnected(false);
    setUser(null);
    setCurrentPage("home");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-purple-950 to-black text-white">
      <Navbar
        isConnected={isConnected}
        user={user}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        onConnect={handleConnect}
        onDisconnect={handleDisconnect}
      />

      <main className="px-6 py-10 max-w-7xl mx-auto">
        {!isConnected && (
          <HomePage
            onConnect={handleConnect}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
          />
        )}
        {isConnected && user && currentPage === "dashboard" && (
          <DashboardPage user={user} setUser={setUser} />
        )}
      </main>

      <footer className="text-center text-gray-500 py-6 border-t border-white/10 mt-12">
        © {new Date().getFullYear()} Starknet Gateway · Built with ❤️ by Sandeep
      </footer>
    </div>
  );
}
