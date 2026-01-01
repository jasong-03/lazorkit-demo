"use client";

/**
 * ConnectWallet Component
 *
 * Handles passkey-based wallet connection using Lazorkit SDK.
 * This component demonstrates:
 * - Connecting with biometric authentication (FaceID/TouchID/Windows Hello)
 * - Disconnecting and managing wallet state
 * - Loading states during connection
 *
 * Note: When the Lazorkit Portal opens, first-time users should click
 * "Create new account" to register a new passkey. Existing users can
 * click "Sign in with Passkey" to authenticate.
 */

import { useState } from "react";
import { useWallet } from "@lazorkit/wallet";
import { truncateAddress } from "@/lib/constants";

export function ConnectWallet() {
  // useWallet hook provides all wallet state and actions
  const { connect, disconnect, isConnected, isConnecting, wallet } = useWallet();
  // Show help tip for first-time users
  const [showTip, setShowTip] = useState(false);

  // Handle connect button click
  const handleConnect = async () => {
    try {
      // Show tip for users who might be connecting for the first time
      setShowTip(true);
      await connect();
      setShowTip(false);
    } catch (error) {
      setShowTip(false);
      // Only log in development to avoid exposing details in production
      if (process.env.NODE_ENV === "development") {
        console.error("Failed to connect wallet:", error);
      }
      // Connection errors are typically handled by the SDK UI
    }
  };

  // Handle disconnect button click
  const handleDisconnect = async () => {
    try {
      await disconnect();
    } catch (error) {
      // Only log in development
      if (process.env.NODE_ENV === "development") {
        console.error("Failed to disconnect wallet:", error);
      }
    }
  };

  // Show connected state with truncated address
  if (isConnected && wallet) {
    return (
      <button
        onClick={handleDisconnect}
        aria-label={`Disconnect wallet ${truncateAddress(wallet.smartWallet)}`}
        className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700
                   text-white rounded-lg transition-colors duration-200 font-medium"
      >
        <span
          className="w-2 h-2 bg-green-400 rounded-full animate-pulse"
          aria-hidden="true"
        />
        {truncateAddress(wallet.smartWallet)}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-4 w-4 ml-1"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
          />
        </svg>
      </button>
    );
  }

  // Show connecting state with helpful tip
  if (isConnecting || showTip) {
    return (
      <div className="flex flex-col items-center gap-3">
        <button
          disabled
          aria-busy="true"
          aria-label="Connecting wallet"
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white
                     rounded-lg font-medium opacity-75 cursor-not-allowed"
        >
          <svg
            className="animate-spin h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          Connecting...
        </button>
        {/* Helpful tip for first-time users */}
        <div className="bg-blue-900/30 border border-blue-500/40 rounded-lg p-3 max-w-xs text-center">
          <p className="text-blue-300 text-xs">
            <strong>First time?</strong> In the popup, click{" "}
            <span className="text-blue-200 font-semibold">&quot;Create new account&quot;</span>{" "}
            to register a new passkey wallet.
          </p>
        </div>
      </div>
    );
  }

  // Default: show connect button with helpful info
  return (
    <div className="flex flex-col items-center gap-2">
      <button
        onClick={handleConnect}
        aria-label="Connect wallet with passkey"
        className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700
                   text-white rounded-lg transition-colors duration-200 font-medium"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4"
          />
        </svg>
        Connect with Passkey
      </button>
      <p className="text-gray-500 text-xs">
        New user? Choose &quot;Create new account&quot; in the popup
      </p>
    </div>
  );
}
