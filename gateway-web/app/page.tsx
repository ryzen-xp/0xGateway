"use client";
import React, { useState } from "react";
import { Toaster } from "react-hot-toast";
import { Navbar } from "./components/Navbar";
import { HomePage } from "./components/HomePage";
import { DashboardPage } from "./components/DashboardPage";
import { useStarknetWallet } from "./hooks/useStarknetWallet";
import Docs from "./components/docs";

export default function App() {
  const [currentPage, setCurrentPage] = useState<"home" | "dashboard" | "docs">(
    "home"
  );
  const { isConnected, username } = useStarknetWallet();

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-purple-950 to-black text-white">
      {/* Toast notifications */}
      <Toaster
        position="bottom-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: "#1f2937",
            color: "#fff",
            border: "1px solid #374151",
          },
          success: {
            iconTheme: {
              primary: "#10b981",
              secondary: "#fff",
            },
          },
          error: {
            iconTheme: {
              primary: "#ef4444",
              secondary: "#fff",
            },
          },
        }}
      />

      {/* Navbar always visible */}
      <Navbar currentPage={currentPage} setCurrentPage={setCurrentPage} />

      <main className="px-6 py-10 max-w-7xl mx-auto">
        {/* Show pages based on connection + selected page */}
        {!isConnected && (
          <HomePage currentPage={currentPage} setCurrentPage={setCurrentPage} />
        )}

        {isConnected && currentPage === "home" && (
          <HomePage currentPage={currentPage} setCurrentPage={setCurrentPage} />
        )}

        {isConnected && username !== "" && currentPage === "dashboard" && (
          <DashboardPage username={username} />
        )}
        {currentPage === "docs" && <Docs></Docs>}
      </main>

      <footer className="text-center text-gray-500 py-6 border-t border-white/10 mt-12">
        © {new Date().getFullYear()} 0xGateway · Built with ❤️ by ryzen_xp
      </footer>
    </div>
  );
}
