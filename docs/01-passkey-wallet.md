# Tutorial 1: Create a Passkey Wallet in 5 Minutes

Learn how to integrate Lazorkit SDK to create a passkey-based Solana wallet. No seed phrases, no browser extensions - just biometric authentication.

## What You'll Build

A React component that:
- Connects to Solana using passkey authentication (FaceID/TouchID/Windows Hello)
- Creates a smart wallet (PDA) controlled by your passkey
- Displays the connected wallet address

## Prerequisites

- Node.js 18+
- Basic React/Next.js knowledge
- A browser that supports WebAuthn (Chrome, Safari, Firefox, Edge)

## Step 1: Create a Next.js Project

```bash
npx create-next-app@latest my-lazorkit-app --typescript --tailwind --app --src-dir
cd my-lazorkit-app
```

## Step 2: Install Dependencies

```bash
npm install @lazorkit/wallet @coral-xyz/anchor @solana/web3.js buffer
```

**What each package does:**
- `@lazorkit/wallet` - The Lazorkit React SDK with hooks and components
- `@coral-xyz/anchor` - Required by Lazorkit for smart wallet interactions
- `@solana/web3.js` - Solana JavaScript SDK
- `buffer` - Browser polyfill for Node.js Buffer

## Step 3: Create the Provider Wrapper

Create a client-side wrapper to provide Lazorkit context to your app.

**`src/components/LazorkitWrapper.tsx`**

```tsx
"use client";

import { useEffect, useState } from "react";
import { LazorkitProvider } from "@lazorkit/wallet";
import { Buffer } from "buffer";

// Devnet configuration (from Lazorkit docs)
const CONFIG = {
  RPC_URL: "https://api.devnet.solana.com",
  PORTAL_URL: "https://portal.lazor.sh",
  PAYMASTER: { paymasterUrl: "https://kora.devnet.lazorkit.com" }
};

export function LazorkitWrapper({ children }: { children: React.ReactNode }) {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Buffer polyfill for browser - required by Solana libraries
    if (typeof window !== "undefined") {
      window.Buffer = window.Buffer || Buffer;
    }
    setIsReady(true);
  }, []);

  if (!isReady) return null;

  return (
    <LazorkitProvider
      rpcUrl={CONFIG.RPC_URL}
      portalUrl={CONFIG.PORTAL_URL}
      paymasterConfig={CONFIG.PAYMASTER}
    >
      {children}
    </LazorkitProvider>
  );
}
```

**Key points:**
- The Buffer polyfill is required because `@solana/web3.js` uses Node.js APIs
- We wait for the polyfill before rendering to avoid hydration issues
- All config values are for Devnet - update for mainnet in production

## Step 4: Wrap Your App with the Provider

Update your root layout to include the provider.

**`src/app/layout.tsx`**

```tsx
import { LazorkitWrapper } from "@/components/LazorkitWrapper";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <LazorkitWrapper>{children}</LazorkitWrapper>
      </body>
    </html>
  );
}
```

## Step 5: Create the Connect Button

Now create the component that handles wallet connection.

**`src/components/ConnectWallet.tsx`**

```tsx
"use client";

import { useWallet } from "@lazorkit/wallet";

export function ConnectWallet() {
  const { connect, disconnect, isConnected, isConnecting, wallet } = useWallet();

  // Connected state
  if (isConnected && wallet) {
    const shortAddress = `${wallet.smartWallet.slice(0, 4)}...${wallet.smartWallet.slice(-4)}`;
    return (
      <button onClick={() => disconnect()}>
        Disconnect ({shortAddress})
      </button>
    );
  }

  // Connecting state
  if (isConnecting) {
    return <button disabled>Connecting...</button>;
  }

  // Default state
  return (
    <button onClick={() => connect()}>
      Connect with Passkey
    </button>
  );
}
```

**The `useWallet` hook provides:**
- `connect()` - Opens the passkey authentication flow
- `disconnect()` - Clears the wallet connection
- `isConnected` - Boolean indicating connection status
- `isConnecting` - Boolean for loading state
- `wallet` - Object containing `smartWallet` address when connected

## Step 6: Use the Component

**`src/app/page.tsx`**

```tsx
import { ConnectWallet } from "@/components/ConnectWallet";

export default function Home() {
  return (
    <main>
      <h1>My Lazorkit App</h1>
      <ConnectWallet />
    </main>
  );
}
```

## Step 7: Test It!

```bash
npm run dev
```

Open http://localhost:3000 and click "Connect with Passkey":

1. A popup from Lazorkit Portal will appear
2. Your browser will prompt for biometric authentication
3. On first connection, a new passkey credential is created
4. Your smart wallet address is derived from this passkey

## Understanding What Happened

When you connected:

1. **WebAuthn Credential Created**: Your browser created a passkey stored in your device's Secure Enclave
2. **Smart Wallet Derived**: Lazorkit's on-chain program derived a PDA (Program Derived Address) controlled by your passkey
3. **Session Established**: The connection is persisted so you don't need to re-authenticate

The private key material **never leaves your device**. It's stored in hardware (Secure Enclave on Apple devices, TPM on Windows, etc.).

## Next Steps

- [Tutorial 2: Send Gasless USDC](./02-gasless-usdc.md) - Learn to send USDC without needing SOL for gas
- [Lazorkit Docs](https://docs.lazorkit.com) - Full API reference

## Troubleshooting

### "Buffer is not defined"
Make sure you've added the Buffer polyfill in `LazorkitWrapper.tsx` and it runs before any Solana code.

### Passkey prompt doesn't appear
- Check that you're using HTTPS (or localhost)
- Try a different browser (Chrome has the best WebAuthn support)
- Ensure your device has biometrics enabled

### "Failed to connect wallet"
- Check browser console for detailed errors
- Verify the Portal URL is correct
- Ensure you have internet connectivity
