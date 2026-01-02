# Tutorial 2: Send Gasless USDC on Solana

Learn how to send USDC transfers without holding SOL for gas fees using Lazorkit's paymaster service.

## What You'll Build

A transfer form that:
- Sends USDC to any Solana address
- Uses the paymaster to sponsor gas (user pays a tiny USDC fee instead of SOL)
- Shows transaction status and explorer links

## Prerequisites

- Completed [Tutorial 1: Passkey Wallet Setup](./01-passkey-wallet.md)
- Devnet USDC in your wallet (we'll show you how to get some)

## How Gasless Transactions Work

Traditional Solana transactions require SOL for gas fees. This is a UX barrier - users need to acquire SOL before they can do anything.

Lazorkit's paymaster solves this:

1. **You submit a transaction** with `feeToken: "USDC"`
2. **The paymaster pays the SOL gas fee** on your behalf
3. **A small USDC fee is deducted** from your transfer amount
4. **Your transaction confirms** - you never needed SOL!

## Step 1: Get Devnet USDC

First, fund your wallet with test USDC:

1. Connect your Lazorkit wallet
2. Copy your smart wallet address
3. Visit a Solana faucet like [spl-token-faucet.com](https://spl-token-faucet.com) or use the Solana CLI
4. Request Devnet USDC to your address

**Using Solana CLI:**
```bash
# Airdrop SOL first (for creating token account)
solana airdrop 1 <YOUR_WALLET_ADDRESS> --url devnet

# The faucet will create your USDC token account
```

## Step 2: Install SPL Token Library

```bash
npm install @solana/spl-token
```

## Step 3: Create the Transfer Component

**`src/components/SendUSDC.tsx`**

```tsx
"use client";

import { useState, useCallback } from "react";
import { useWallet } from "@lazorkit/wallet";
import { PublicKey } from "@solana/web3.js";
import {
  createTransferInstruction,
  getAssociatedTokenAddress,
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token";

// Devnet USDC mint address
const USDC_MINT = "4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU";

export function SendUSDC() {
  const { isConnected, smartWalletPubkey, signAndSendTransaction } = useWallet();

  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");
  const [status, setStatus] = useState<"idle" | "pending" | "success" | "error">("idle");
  const [signature, setSignature] = useState("");
  const [error, setError] = useState("");

  // Validate Solana address
  const isValidAddress = useCallback((address: string): boolean => {
    try {
      new PublicKey(address);
      return true;
    } catch {
      return false;
    }
  }, []);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!smartWalletPubkey || !isValidAddress(recipient)) return;

    setStatus("pending");
    setError("");

    try {
      // Convert amount to token units (USDC has 6 decimals)
      const amountInUnits = Math.floor(parseFloat(amount) * 1_000_000);

      const usdcMint = new PublicKey(USDC_MINT);
      const recipientPubkey = new PublicKey(recipient);

      // Get Associated Token Accounts (ATAs)
      const senderATA = await getAssociatedTokenAddress(usdcMint, smartWalletPubkey);
      const recipientATA = await getAssociatedTokenAddress(usdcMint, recipientPubkey);

      // Create the transfer instruction
      const transferInstruction = createTransferInstruction(
        senderATA,         // From: Your token account
        recipientATA,      // To: Recipient's token account
        smartWalletPubkey, // Authority: Your smart wallet
        amountInUnits      // Amount in smallest units
      );

      // Sign and send with gasless option
      const txSignature = await signAndSendTransaction({
        instructions: [transferInstruction],
        transactionOptions: {
          feeToken: "USDC"  // ← This enables gasless!
        }
      });

      setSignature(txSignature);
      setStatus("success");
      setRecipient("");
      setAmount("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Transfer failed");
      setStatus("error");
    }
  };

  if (!isConnected) return null;

  return (
    <div>
      <h2>Send USDC (Gasless)</h2>

      <form onSubmit={handleSend}>
        <div>
          <label>Recipient Address</label>
          <input
            type="text"
            value={recipient}
            onChange={(e) => setRecipient(e.target.value)}
            placeholder="Enter Solana address..."
          />
        </div>

        <div>
          <label>Amount (USDC)</label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            step="0.01"
            min="0"
          />
        </div>

        <button type="submit" disabled={status === "pending"}>
          {status === "pending" ? "Sending..." : "Send USDC"}
        </button>
      </form>

      {/* Status messages */}
      {status === "success" && (
        <div>
          <p>Transaction successful!</p>
          <a
            href={`https://explorer.solana.com/tx/${signature}?cluster=devnet`}
            target="_blank"
          >
            View on Explorer
          </a>
        </div>
      )}

      {status === "error" && <p style={{color: "red"}}>{error}</p>}
    </div>
  );
}
```

## Step 4: Understanding the Code

### Associated Token Accounts (ATAs)

SPL tokens (like USDC) aren't stored directly in wallet addresses. Each token type has its own account:

```tsx
// This derives the token account address for a given mint and owner
const senderATA = await getAssociatedTokenAddress(usdcMint, smartWalletPubkey);
```

### The Transfer Instruction

```tsx
const transferInstruction = createTransferInstruction(
  senderATA,         // Source token account
  recipientATA,      // Destination token account
  smartWalletPubkey, // Authority who can sign
  amountInUnits      // Amount (USDC uses 6 decimals)
);
```

### The Gasless Magic

```tsx
const txSignature = await signAndSendTransaction({
  instructions: [transferInstruction],
  transactionOptions: {
    feeToken: "USDC"  // This tells the paymaster to sponsor gas
  }
});
```

When you set `feeToken: "USDC"`:
1. Lazorkit routes through its paymaster service
2. The paymaster pays the SOL gas fee
3. A small USDC fee is added to your transfer
4. You never need to hold SOL!

## Step 5: Handle Edge Cases

### Recipient Doesn't Have a Token Account

If the recipient has never held USDC, they won't have an ATA. The transaction will fail unless you also create their account.

For a production app, you'd want to:

```tsx
import {
  createAssociatedTokenAccountInstruction,
  getAccount
} from "@solana/spl-token";

// Check if recipient ATA exists
try {
  await getAccount(connection, recipientATA);
} catch {
  // ATA doesn't exist - add instruction to create it
  instructions.push(
    createAssociatedTokenAccountInstruction(
      smartWalletPubkey, // Payer
      recipientATA,      // ATA to create
      recipientPubkey,   // Owner of new ATA
      usdcMint           // Token mint
    )
  );
}
```

### Insufficient Balance

Always validate the user has enough USDC before submitting:

```tsx
const balance = await connection.getTokenAccountBalance(senderATA);
if (balance.value.uiAmount < parseFloat(amount)) {
  throw new Error("Insufficient USDC balance");
}
```

## Step 6: Test It!

1. Ensure you have Devnet USDC in your wallet
2. Enter a recipient address (can be your own for testing)
3. Enter an amount (start small, like 0.01)
4. Click Send and approve with your passkey
5. View the transaction on Solana Explorer

## What Happens On-Chain

When the transaction confirms:

1. Your smart wallet's USDC balance decreases by `amount + fee`
2. The recipient's USDC balance increases by `amount`
3. The paymaster receives the fee portion
4. The paymaster paid the SOL gas - you never held any!

## Error Handling Tips

| Error | Cause | Solution |
|-------|-------|----------|
| "Insufficient funds" | Not enough USDC | Check balance, get more from faucet |
| "Invalid address" | Malformed recipient | Validate before submitting |
| "Account not found" | Recipient has no ATA | Create their ATA in same transaction |
| "Paymaster error" | Service temporarily down | Retry or fallback to SOL gas |

## Next Steps

- Add balance display before sending
- Implement recipient ATA creation
- Add transaction history
- Deploy to Vercel and test on real Devnet

## Resources

- [SPL Token Documentation](https://spl.solana.com/token)
- [Lazorkit API Reference](https://docs.lazorkit.com/react-sdk)
- [Solana Explorer (Devnet)](https://explorer.solana.com/?cluster=devnet)
