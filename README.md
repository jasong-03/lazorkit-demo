# Lazorkit Payment Starter

A production-ready starter template for building **passkey-authenticated Solana wallets** with **gasless USDC transfers** using the Lazorkit SDK.

> No seed phrases. No browser extensions. Just your fingerprint or face.

**Live Demo:** [lazorkit-demo-drab.vercel.app](https://lazorkit-demo-drab.vercel.app)

---

## Project Overview

This starter demonstrates two core features of the Lazorkit SDK:

### 1. Passkey-Based Wallet Authentication
- Users authenticate with biometrics (FaceID, TouchID, Windows Hello)
- No seed phrases or private keys to manage
- Credentials stored securely in device's Secure Enclave
- Smart wallet (PDA) derived from WebAuthn credential

### 2. Gasless USDC Transfers
- Send USDC without holding SOL for gas fees
- Paymaster sponsors transaction fees
- Small USDC fee deducted instead of SOL
- Seamless user experience

### Tech Stack
| Technology | Purpose |
|------------|---------|
| [Next.js 16](https://nextjs.org/) | React framework (App Router) |
| [Lazorkit SDK v2.0.1](https://docs.lazorkit.com/) | Passkey wallet infrastructure |
| [Solana Web3.js](https://solana-labs.github.io/solana-web3.js/) | Blockchain interaction |
| [SPL Token](https://spl.solana.com/token) | Token transfers |
| [Tailwind CSS](https://tailwindcss.com/) | Styling |
| TypeScript | Type safety |

---

## SDK Installation & Configuration

### Step 1: Install Dependencies

```bash
npm install @lazorkit/wallet @solana/web3.js @solana/spl-token
```

### Step 2: Configure the Provider

Create a wrapper component with the Lazorkit provider:

```tsx
// src/components/LazorkitWrapper.tsx
"use client";

import { LazorkitProvider } from "@lazorkit/wallet";

const LAZORKIT_CONFIG = {
  RPC_URL: "https://api.devnet.solana.com",
  PORTAL_URL: "https://portal.lazor.sh",
  PAYMASTER: {
    paymasterUrl: "https://kora.devnet.lazorkit.com",
  },
};

export function LazorkitWrapper({ children }: { children: React.ReactNode }) {
  return (
    <LazorkitProvider
      rpcUrl={LAZORKIT_CONFIG.RPC_URL}
      portalUrl={LAZORKIT_CONFIG.PORTAL_URL}
      paymaster={LAZORKIT_CONFIG.PAYMASTER}
    >
      {children}
    </LazorkitProvider>
  );
}
```

### Step 3: Wrap Your App

```tsx
// src/app/layout.tsx
import { LazorkitWrapper } from "@/components/LazorkitWrapper";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <LazorkitWrapper>{children}</LazorkitWrapper>
      </body>
    </html>
  );
}
```

### Step 4: Use the Wallet Hook

```tsx
// In any component
import { useWallet } from "@lazorkit/wallet";

function MyComponent() {
  const {
    connect,           // Connect with passkey
    disconnect,        // Disconnect wallet
    isConnected,       // Connection status
    wallet,            // Wallet info (smartWallet address)
    smartWalletPubkey, // PublicKey object
    signAndSendTransaction // Sign & send transactions
  } = useWallet();

  return (
    <button onClick={connect}>
      {isConnected ? wallet?.smartWallet : "Connect"}
    </button>
  );
}
```

---

## Environment Setup

### Prerequisites

| Requirement | Version | Check Command |
|-------------|---------|---------------|
| Node.js | 18+ | `node --version` |
| npm | 9+ | `npm --version` |
| Git | Any | `git --version` |

### Browser Requirements

WebAuthn (passkeys) requires a compatible browser:
- Chrome 67+
- Safari 13+
- Firefox 60+
- Edge 79+

### Network Configuration

| Network | RPC URL | Paymaster URL |
|---------|---------|---------------|
| **Devnet** (default) | `https://api.devnet.solana.com` | `https://kora.devnet.lazorkit.com` |
| **Mainnet** | Your RPC provider | `https://kora.mainnet.lazorkit.com` |

---

## Instructions to Run

### Quick Start (3 steps)

```bash
# 1. Clone the repository
git clone https://github.com/jasong-03/lazorkit-demo.git
cd lazorkit-demo

# 2. Install dependencies
npm install

# 3. Start development server
npm run dev
```

Open **http://localhost:3000** in your browser.

### Running with HTTPS (Required for WebAuthn signing)

WebAuthn requires HTTPS for transaction signing. Choose one option:

**Option A: Deploy to Vercel (Recommended)**
```bash
npm i -g vercel
vercel login
vercel --yes
```

**Option B: Local HTTPS with mkcert**
```bash
# Install mkcert (macOS)
brew install mkcert
mkcert -install

# Run with HTTPS
npm run dev:https
```

Then open **https://localhost:3000**

---

## Testing the Demo

### Step 1: Get Test Funds

| Token | Faucet | Amount Needed |
|-------|--------|---------------|
| SOL | [faucet.solana.com](https://faucet.solana.com) | ~0.01 SOL (for rent) |
| USDC | [faucet.circle.com](https://faucet.circle.com) | Any amount |

> **Note:** Select "Solana Devnet" on Circle's faucet.

### Step 2: Connect Wallet

1. Click **"Connect with Passkey"**
2. First time? Select **"Create new account"** in the popup
3. Authenticate with your biometric (Face/Touch ID)

### Step 3: Send USDC

1. Enter a recipient Solana address
2. Enter amount (e.g., `0.1` USDC)
3. Click **"Send USDC"**
4. Approve the transaction with your passkey
5. View on [Solana Explorer](https://explorer.solana.com/?cluster=devnet)

---

## Project Structure

```
lazorkit-demo/
├── src/
│   ├── app/
│   │   ├── layout.tsx          # Root layout with LazorkitProvider
│   │   ├── page.tsx            # Main demo page
│   │   └── globals.css         # Global styles
│   ├── components/
│   │   ├── ConnectWallet.tsx   # Passkey connect/disconnect button
│   │   ├── WalletInfo.tsx      # Address display + balances
│   │   ├── SendUSDC.tsx        # USDC transfer form
│   │   ├── TxStatus.tsx        # Transaction status display
│   │   ├── LazorkitWrapper.tsx # Provider configuration
│   │   └── index.ts            # Barrel exports
│   └── lib/
│       └── constants.ts        # Config, utilities, addresses
├── docs/
│   ├── 01-passkey-wallet.md    # Tutorial: Passkey Authentication
│   └── 02-gasless-usdc.md      # Tutorial: Gasless Transfers
├── server.js                   # Custom HTTPS server (local dev)
└── package.json
```

---

## Key Code Examples

### Connect Wallet

```tsx
const { connect, isConnected } = useWallet();

<button onClick={connect}>
  {isConnected ? "Connected" : "Connect with Passkey"}
</button>
```

### Send Gasless USDC

```tsx
const { signAndSendTransaction, smartWalletPubkey } = useWallet();

const signature = await signAndSendTransaction({
  instructions: [transferInstruction],
  transactionOptions: {
    feeToken: "USDC"  // Enables gasless - paymaster pays SOL, deducts USDC
  }
});
```

### Check Balances

```tsx
import { Connection, LAMPORTS_PER_SOL } from "@solana/web3.js";

const connection = new Connection("https://api.devnet.solana.com");
const balance = await connection.getBalance(walletPubkey);
const solAmount = balance / LAMPORTS_PER_SOL;
```

---

## Deployment

### Vercel (Recommended)

1. Push code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Import your repository
4. Click Deploy

Or via CLI:
```bash
vercel --yes
```

### Other Platforms

Works with any Next.js-compatible host:
- [Netlify](https://netlify.com)
- [Railway](https://railway.app)
- [AWS Amplify](https://aws.amazon.com/amplify/)

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| "WebAuthn not supported on sites with TLS errors" | Deploy to HTTPS (Vercel) or use `mkcert -install` locally |
| "Insufficient lamports" error | Get more SOL from faucet (~0.002 SOL needed for new token accounts) |
| "No passkeys available" | Click "Create new account" in the Lazorkit portal |
| Transaction fails silently | Check browser console for detailed error logs |

---

## Resources

- [Lazorkit Documentation](https://docs.lazorkit.com/)
- [Lazorkit GitHub](https://github.com/lazor-kit/lazor-kit)
- [Solana Cookbook](https://solanacookbook.com/)
- [SPL Token Documentation](https://spl.solana.com/token)

---

## License

MIT License - Use freely for your own projects.

---

Built for the [Lazorkit Bounty](https://docs.lazorkit.com/) | [Live Demo](https://lazorkit-demo-drab.vercel.app)
