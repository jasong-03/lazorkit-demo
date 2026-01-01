"use client";

/**
 * WalletInfo Component
 *
 * Displays information about the connected smart wallet:
 * - Full wallet address with copy functionality
 * - SOL and USDC balances
 * - Link to view on Solana Explorer
 *
 * This component only renders when a wallet is connected.
 */

import { useState, useRef, useEffect, useCallback } from "react";
import { useWallet } from "@lazorkit/wallet";
import { Connection, PublicKey, LAMPORTS_PER_SOL } from "@solana/web3.js";
import { getAssociatedTokenAddress, getAccount } from "@solana/spl-token";
import { getExplorerAddressUrl, truncateAddress, LAZORKIT_CONFIG, USDC_MINT_DEVNET } from "@/lib/constants";

// USDC has 6 decimals
const USDC_DECIMALS = 6;

interface Balances {
  sol: number | null;
  usdc: number | null;
  loading: boolean;
}

export function WalletInfo() {
  const { isConnected, wallet } = useWallet();
  const [copied, setCopied] = useState(false);
  const [balances, setBalances] = useState<Balances>({ sol: null, usdc: null, loading: true });
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Fetch balances
  const fetchBalances = useCallback(async () => {
    if (!wallet?.smartWallet) return;

    setBalances(prev => ({ ...prev, loading: true }));

    try {
      const connection = new Connection(LAZORKIT_CONFIG.RPC_URL);
      const walletPubkey = new PublicKey(wallet.smartWallet);

      // Fetch SOL balance
      const solBalance = await connection.getBalance(walletPubkey);
      const solAmount = solBalance / LAMPORTS_PER_SOL;

      // Fetch USDC balance
      let usdcAmount = 0;
      try {
        const usdcMint = new PublicKey(USDC_MINT_DEVNET);
        const ata = await getAssociatedTokenAddress(usdcMint, walletPubkey, true);
        const tokenAccount = await getAccount(connection, ata);
        usdcAmount = Number(tokenAccount.amount) / Math.pow(10, USDC_DECIMALS);
      } catch {
        // No USDC account or zero balance
        usdcAmount = 0;
      }

      setBalances({ sol: solAmount, usdc: usdcAmount, loading: false });
    } catch (error) {
      if (process.env.NODE_ENV === "development") {
        console.error("Failed to fetch balances:", error);
      }
      setBalances({ sol: null, usdc: null, loading: false });
    }
  }, [wallet?.smartWallet]);

  // Fetch balances on mount and when wallet changes
  useEffect(() => {
    fetchBalances();
    // Refresh balances every 30 seconds
    const interval = setInterval(fetchBalances, 30000);
    return () => clearInterval(interval);
  }, [fetchBalances]);

  // Cleanup timeout on unmount to prevent memory leaks
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  // Don't render if not connected
  if (!isConnected || !wallet) {
    return null;
  }

  const smartWalletAddress = wallet.smartWallet;

  // Copy address to clipboard
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(smartWalletAddress);
      setCopied(true);

      // Clear any existing timeout to prevent race condition
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      // Reset copied state after 2 seconds
      timeoutRef.current = setTimeout(() => {
        setCopied(false);
        timeoutRef.current = null;
      }, 2000);
    } catch (error) {
      // Only log in development
      if (process.env.NODE_ENV === "development") {
        console.error("Failed to copy address:", error);
      }
    }
  };

  return (
    <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
      <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5 text-purple-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
          />
        </svg>
        Smart Wallet
      </h2>

      {/* Wallet Address Display */}
      <div className="space-y-3">
        <div className="flex items-center justify-between bg-gray-800 rounded-lg p-3">
          <div className="flex flex-col">
            <span className="text-xs text-gray-400 mb-1">Wallet Address</span>
            <span className="text-white font-mono text-sm">
              {truncateAddress(smartWalletAddress, 8)}
            </span>
          </div>

          <div className="flex gap-2">
            {/* Copy Button */}
            <button
              onClick={handleCopy}
              className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
              aria-label={copied ? "Address copied" : "Copy wallet address"}
            >
              {copied ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 text-green-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 text-gray-300"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                  />
                </svg>
              )}
            </button>

            {/* Explorer Link */}
            <a
              href={getExplorerAddressUrl(smartWalletAddress)}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
              aria-label="View wallet on Solana Explorer"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 text-gray-300"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                />
              </svg>
            </a>
          </div>
        </div>

        {/* Balance Display */}
        <div className="bg-gray-800 rounded-lg p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-gray-400">Balances</span>
            <button
              onClick={fetchBalances}
              disabled={balances.loading}
              className="text-xs text-purple-400 hover:text-purple-300 disabled:opacity-50"
              aria-label="Refresh balances"
            >
              {balances.loading ? "Loading..." : "Refresh"}
            </button>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {/* SOL Balance */}
            <div className="bg-gray-700/50 rounded-lg p-2">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-purple-500 to-green-400 flex items-center justify-center">
                  <span className="text-xs font-bold text-white">S</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-white font-medium text-sm">
                    {balances.loading ? (
                      <span className="text-gray-500">...</span>
                    ) : balances.sol !== null ? (
                      balances.sol.toFixed(4)
                    ) : (
                      "0"
                    )}
                  </span>
                  <span className="text-xs text-gray-400">SOL</span>
                </div>
              </div>
            </div>
            {/* USDC Balance */}
            <div className="bg-gray-700/50 rounded-lg p-2">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center">
                  <span className="text-xs font-bold text-white">$</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-white font-medium text-sm">
                    {balances.loading ? (
                      <span className="text-gray-500">...</span>
                    ) : balances.usdc !== null ? (
                      balances.usdc.toFixed(2)
                    ) : (
                      "0"
                    )}
                  </span>
                  <span className="text-xs text-gray-400">USDC</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Info Box */}
        <div className="bg-purple-900/20 border border-purple-500/30 rounded-lg p-3">
          <p className="text-xs text-purple-300">
            This is your Lazorkit smart wallet - a PDA (Program Derived Address) controlled
            by your passkey. No seed phrase needed!
          </p>
        </div>
      </div>
    </div>
  );
}
