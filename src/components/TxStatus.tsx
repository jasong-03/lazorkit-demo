"use client";

/**
 * TxStatus Component
 *
 * Displays transaction status feedback to the user:
 * - Loading state while transaction is pending
 * - Success state with explorer link
 * - Error state with error message
 */

import { getExplorerTxUrl } from "@/lib/constants";

export type TransactionState = {
  status: "idle" | "pending" | "success" | "error";
  signature?: string;
  error?: string;
};

interface TxStatusProps {
  state: TransactionState;
  onDismiss?: () => void;
}

export function TxStatus({ state, onDismiss }: TxStatusProps) {
  // Don't render if idle
  if (state.status === "idle") {
    return null;
  }

  // Pending state
  if (state.status === "pending") {
    return (
      <div className="flex items-center gap-3 bg-blue-900/30 border border-blue-500/30 rounded-lg p-4">
        <svg
          className="animate-spin h-5 w-5 text-blue-400"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
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
        <div className="flex-1">
          <p className="text-blue-300 font-medium">Transaction Pending</p>
          <p className="text-blue-400/70 text-sm">
            Please approve the transaction with your passkey...
          </p>
        </div>
      </div>
    );
  }

  // Success state
  if (state.status === "success" && state.signature) {
    return (
      <div className="flex items-start gap-3 bg-green-900/30 border border-green-500/30 rounded-lg p-4">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5 text-green-400 mt-0.5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <div className="flex-1 min-w-0">
          <p className="text-green-300 font-medium">Transaction Successful!</p>
          <a
            href={getExplorerTxUrl(state.signature)}
            target="_blank"
            rel="noopener noreferrer"
            className="text-green-400 hover:text-green-300 text-sm underline break-all"
          >
            View on Solana Explorer
          </a>
        </div>
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="text-green-400 hover:text-green-300 p-1"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        )}
      </div>
    );
  }

  // Error state
  if (state.status === "error") {
    return (
      <div className="flex items-start gap-3 bg-red-900/30 border border-red-500/30 rounded-lg p-4">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5 text-red-400 mt-0.5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <div className="flex-1 min-w-0">
          <p className="text-red-300 font-medium">Transaction Failed</p>
          <p className="text-red-400/70 text-sm break-words">
            {state.error || "An unknown error occurred"}
          </p>
        </div>
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="text-red-400 hover:text-red-300 p-1"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        )}
      </div>
    );
  }

  return null;
}
