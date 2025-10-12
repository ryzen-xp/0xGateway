"use client";
import React, { useState } from "react";
import { Navbar } from "./components/Navbar";
import { HomePage } from "./components/HomePage";
import { DashboardPage } from "./components/DashboardPage";
import { useStarknetWallet } from "./hooks/useStarknetWallet";

export default function App() {
  const [currentPage, setCurrentPage] = useState<"home" | "dashboard">("home");
  const { isConnected, username } = useStarknetWallet();

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-purple-950 to-black text-white">
      {/* Navbar always visible */}
      <Navbar currentPage={currentPage} setCurrentPage={setCurrentPage} />

      <main className="px-6 py-10 max-w-7xl mx-auto">
        {/* Show pages based on connection + selected page */}
        {!isConnected && <HomePage />}

        {isConnected && currentPage === "home" && <HomePage />}

        {isConnected && username !== "" && currentPage === "dashboard" && (
          <DashboardPage username={username} />
        )}
      </main>

      <footer className="text-center text-gray-500 py-6 border-t border-white/10 mt-12">
        © {new Date().getFullYear()} 0xGateway · Built with ❤️ by ryzen_xp
      </footer>
    </div>
  );
}
