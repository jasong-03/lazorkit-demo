"use client";

/**
 * SendUSDC Component
 *
 * Demonstrates gasless USDC transfers using Lazorkit's paymaster.
 * Key features:
 * - Input validation for recipient address and amount
 * - Balance checking before transfer
 * - Auto-creation of recipient token account if needed
 * - Gasless transaction via paymaster (user doesn't need SOL for fees)
 * - Fee payment in USDC using feeToken option
 */

import { useState, useCallback } from "react";
import { useWallet } from "@lazorkit/wallet";
import { PublicKey, Connection } from "@solana/web3.js";
import {
  createTransferInstruction,
  createAssociatedTokenAccountInstruction,
  getAssociatedTokenAddress,
  getAccount,
  TOKEN_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import { TxStatus, TransactionState } from "./TxStatus";
import { USDC_MINT_DEVNET, LAZORKIT_CONFIG } from "@/lib/constants";

// USDC has 6 decimals
const USDC_DECIMALS = 6;

export function SendUSDC() {
  const { isConnected, smartWalletPubkey, signAndSendTransaction } = useWallet();

  // Form state
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");

  // Transaction state
  const [txState, setTxState] = useState<TransactionState>({ status: "idle" });

  // Validate Solana address (with trimming)
  const isValidAddress = useCallback((address: string): boolean => {
    try {
      const trimmed = address.trim();
      if (!trimmed) return false;
      new PublicKey(trimmed);
      return true;
    } catch {
      return false;
    }
  }, []);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Sanitize inputs
    const trimmedRecipient = recipient.trim();
    const trimmedAmount = amount.trim();

    // Validate wallet connection
    if (!smartWalletPubkey) {
      setTxState({ status: "error", error: "Wallet not connected" });
      return;
    }

    // Validate recipient address
    if (!isValidAddress(trimmedRecipient)) {
      setTxState({ status: "error", error: "Invalid recipient address" });
      return;
    }

    // Validate amount before parsing
    if (!trimmedAmount) {
      setTxState({ status: "error", error: "Please enter an amount" });
      return;
    }

    const amountNum = parseFloat(trimmedAmount);
    if (isNaN(amountNum) || amountNum <= 0) {
      setTxState({ status: "error", error: "Amount must be greater than 0" });
      return;
    }

    // Set pending state
    setTxState({ status: "pending" });

    try {
      // Calculate transfer amount with proper precision
      const transferAmount = BigInt(
        Math.round(amountNum * Math.pow(10, USDC_DECIMALS))
      );

      // Get the USDC mint public key
      const usdcMint = new PublicKey(USDC_MINT_DEVNET);
      const recipientPubkey = new PublicKey(trimmedRecipient);

      // Create connection for balance/account checks
      const connection = new Connection(LAZORKIT_CONFIG.RPC_URL);

      // Get associated token accounts
      // Note: allowOwnerOffCurve must be true for PDAs (like Lazorkit smart wallets)
      const senderATA = await getAssociatedTokenAddress(
        usdcMint,
        smartWalletPubkey,
        true  // allowOwnerOffCurve - required for PDA smart wallets
      );
      const recipientATA = await getAssociatedTokenAddress(
        usdcMint,
        recipientPubkey,
        true  // allowOwnerOffCurve - in case recipient is also a PDA
      );

      // Check sender balance
      try {
        const senderAccount = await getAccount(connection, senderATA);
        if (senderAccount.amount < transferAmount) {
          setTxState({
            status: "error",
            error: `Insufficient USDC balance. You have ${
              Number(senderAccount.amount) / Math.pow(10, USDC_DECIMALS)
            } USDC`
          });
          return;
        }
      } catch {
        setTxState({
          status: "error",
          error: "No USDC balance found. Please fund your wallet with USDC first."
        });
        return;
      }

      // Build instructions array
      const instructions = [];

      // Check if recipient ATA exists, create if not
      let needsAtaCreation = false;
      try {
        await getAccount(connection, recipientATA);
      } catch {
        needsAtaCreation = true;
      }

      // If recipient needs ATA creation, check sender has enough SOL for rent
      if (needsAtaCreation) {
        const solBalance = await connection.getBalance(smartWalletPubkey);
        const rentExempt = 2039280; // ~0.002 SOL for token account rent

        if (solBalance < rentExempt) {
          setTxState({
            status: "error",
            error: `Need ~0.002 SOL to create recipient's token account. You have ${(solBalance / 1e9).toFixed(4)} SOL. Get more SOL from faucet.solana.com`
          });
          return;
        }

        // Add instruction to create recipient ATA
        instructions.push(
          createAssociatedTokenAccountInstruction(
            smartWalletPubkey,    // Payer
            recipientATA,         // ATA to create
            recipientPubkey,      // Owner of new ATA
            usdcMint,             // Token mint
            TOKEN_PROGRAM_ID,
            ASSOCIATED_TOKEN_PROGRAM_ID
          )
        );
      }

      // Add transfer instruction
      instructions.push(
        createTransferInstruction(
          senderATA,           // Source token account
          recipientATA,        // Destination token account
          smartWalletPubkey,   // Owner of source account (smart wallet)
          transferAmount,      // Amount in smallest units (bigint)
          [],                  // No additional signers
          TOKEN_PROGRAM_ID     // SPL Token program
        )
      );

      // Sign and send with gasless option (fee paid in USDC)
      const signature = await signAndSendTransaction({
        instructions,
        transactionOptions: {
          feeToken: "USDC" // This enables gasless - paymaster pays SOL, deducts USDC
        }
      });

      // Success!
      setTxState({ status: "success", signature });

      // Clear form
      setRecipient("");
      setAmount("");
    } catch (error) {
      // Log error in development only
      if (process.env.NODE_ENV === "development") {
        console.error("Transfer failed:", error);
      }

      // Extract user-friendly error message
      let errorMessage = "Transfer failed. Please try again.";
      if (error instanceof Error) {
        // Sanitize error message - don't expose internal details
        if (error.message.includes("insufficient lamports") || error.message.includes("lamports")) {
          errorMessage = "Need more SOL to create recipient's token account. Get SOL from faucet.solana.com";
        } else if (error.message.includes("insufficient") || error.message.includes("Insufficient")) {
          errorMessage = "Insufficient funds for this transaction.";
        } else if (error.message.includes("rejected") || error.message.includes("Rejected")) {
          errorMessage = "Transaction was rejected.";
        } else if (error.message.includes("timeout") || error.message.includes("timed out")) {
          errorMessage = "Transaction timed out. Please try again.";
        } else if (error.message.includes("network") || error.message.includes("Network")) {
          errorMessage = "Network error. Please check your connection.";
        } else if (error.message.includes("TokenOwnerOffCurve") || error.name === "TokenOwnerOffCurveError") {
          errorMessage = "Token account error. Please try again.";
        } else if (error.message.includes("not allowed") || error.message.includes("cancelled")) {
          errorMessage = "Operation was cancelled. Please try again.";
        }
      }

      setTxState({ status: "error", error: errorMessage });
    }
  };

  // Reset transaction state
  const handleDismiss = () => {
    setTxState({ status: "idle" });
  };

  // Don't render if not connected
  if (!isConnected) {
    return null;
  }

  // Get trimmed recipient for validation display
  const trimmedRecipient = recipient.trim();

  return (
    <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
      <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5 text-green-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        Send USDC (Gasless)
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4" aria-label="Send USDC form">
        {/* Recipient Address Input */}
        <div>
          <label
            htmlFor="recipient"
            className="block text-sm text-gray-400 mb-1"
          >
            Recipient Address
          </label>
          <input
            type="text"
            id="recipient"
            value={recipient}
            onChange={(e) => setRecipient(e.target.value)}
            placeholder="Enter Solana address..."
            aria-describedby={trimmedRecipient && !isValidAddress(trimmedRecipient) ? "recipient-error" : undefined}
            aria-invalid={trimmedRecipient ? !isValidAddress(trimmedRecipient) : undefined}
            className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg
                     text-white placeholder-gray-500 focus:outline-none focus:ring-2
                     focus:ring-purple-500 focus:border-transparent font-mono text-sm"
          />
          {trimmedRecipient && !isValidAddress(trimmedRecipient) && (
            <p id="recipient-error" className="text-red-400 text-xs mt-1" role="alert">
              Invalid Solana address
            </p>
          )}
        </div>

        {/* Amount Input */}
        <div>
          <label htmlFor="amount" className="block text-sm text-gray-400 mb-1">
            Amount (USDC)
          </label>
          <input
            type="number"
            id="amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            step="0.000001"
            min="0"
            aria-label="Amount in USDC"
            className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg
                     text-white placeholder-gray-500 focus:outline-none focus:ring-2
                     focus:ring-purple-500 focus:border-transparent"
          />
        </div>

        {/* Info Box */}
        <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-3">
          <p className="text-xs text-green-300">
            <strong>Gasless Transaction:</strong> You don&apos;t need SOL to pay for this
            transaction. The paymaster sponsors the gas fee, and a small USDC fee
            is deducted instead.
          </p>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={
            txState.status === "pending" ||
            !trimmedRecipient ||
            !amount.trim() ||
            !isValidAddress(trimmedRecipient)
          }
          aria-busy={txState.status === "pending"}
          className="w-full py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-600
                   disabled:cursor-not-allowed text-white font-medium rounded-lg
                   transition-colors duration-200"
        >
          {txState.status === "pending" ? "Sending..." : "Send USDC"}
        </button>
      </form>

      {/* Transaction Status */}
      <div className="mt-4" role="status" aria-live="polite">
        <TxStatus state={txState} onDismiss={handleDismiss} />
      </div>
    </div>
  );
}
