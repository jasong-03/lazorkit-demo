# Lazorkit Payment Starter

A starter template demonstrating **Lazorkit SDK** integration with passkey-based authentication and gasless USDC transfers on Solana.

> No seed phrases. No browser extensions. Just biometrics.

## Features

- **Passkey Authentication** - Sign in with FaceID, TouchID, or Windows Hello
- **Smart Wallets** - PDA-based accounts controlled by your passkey
- **Gasless Transactions** - Send USDC without holding SOL for gas
- **Clean Code** - Well-documented, production-ready patterns

## Quick Start

### Prerequisites

- Node.js 18+
- npm or yarn
- A WebAuthn-compatible browser (Chrome, Safari, Firefox, Edge)

### Installation

```bash
# Clone this repository
git clone https://github.com/YOUR_USERNAME/lazorkit-payment-starter.git
cd lazorkit-payment-starter

# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Environment Variables (Optional)

Copy `.env.example` to `.env.local` to customize:

```bash
cp .env.example .env.local
```

Default values point to Devnet - no changes needed for testing.

## Project Structure

```
lazorkit-payment-starter/
├── src/
│   ├── app/
│   │   ├── layout.tsx          # Root layout with LazorkitProvider
│   │   ├── page.tsx            # Main demo page
│   │   └── globals.css         # Global styles
│   ├── components/
│   │   ├── ConnectWallet.tsx   # Passkey connect/disconnect
│   │   ├── WalletInfo.tsx      # Wallet address display
│   │   ├── SendUSDC.tsx        # USDC transfer form
│   │   ├── TxStatus.tsx        # Transaction feedback
│   │   ├── LazorkitWrapper.tsx # Provider with polyfills
│   │   └── index.ts            # Component exports
│   └── lib/
│       └── constants.ts        # Config and utilities
├── docs/
│   ├── 01-passkey-wallet.md    # Tutorial: Passkey Setup
│   └── 02-gasless-usdc.md      # Tutorial: Gasless Transfers
└── README.md
```

## Tutorials

### [Tutorial 1: Create a Passkey Wallet](./docs/01-passkey-wallet.md)

Learn how to integrate Lazorkit SDK for passkey-based authentication:

- Setting up the provider
- Handling connection states
- Understanding smart wallets

### [Tutorial 2: Send Gasless USDC](./docs/02-gasless-usdc.md)

Build a gasless USDC transfer feature:

- SPL token transfers
- Paymaster integration
- Error handling

## How It Works

### Passkey Authentication

When a user connects:

1. Browser prompts for biometric authentication
2. WebAuthn credential created in device's Secure Enclave
3. Lazorkit derives a smart wallet (PDA) from this credential
4. Private key material never leaves the device

### Gasless Transactions

When sending USDC with `feeToken: "USDC"`:

1. Transaction is routed through Lazorkit's paymaster
2. Paymaster pays the SOL gas fee
3. A small USDC fee is deducted from your transfer
4. You never need to hold SOL!

## Configuration

### Devnet (Default)

```typescript
const CONFIG = {
  RPC_URL: "https://api.devnet.solana.com",
  PORTAL_URL: "https://portal.lazor.sh",
  PAYMASTER: { paymasterUrl: "https://kora.devnet.lazorkit.com" }
};
```

### Mainnet

Update the configuration for production:

```typescript
const CONFIG = {
  RPC_URL: "YOUR_MAINNET_RPC_URL",
  PORTAL_URL: "https://portal.lazor.sh",
  PAYMASTER: { paymasterUrl: "https://kora.mainnet.lazorkit.com" }
};
```

## Testing

### Get Devnet Funds

1. Connect your wallet and copy your address
2. Visit [Solana Faucet](https://faucet.solana.com/) for SOL
3. Use a USDC faucet for Devnet USDC

### Test the Transfer

1. Enter any valid Solana address as recipient
2. Enter a small amount (e.g., 0.01 USDC)
3. Click Send and approve with your passkey
4. View the transaction on [Solana Explorer](https://explorer.solana.com/?cluster=devnet)

## Deployment

### Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

Or connect your GitHub repository to [Vercel](https://vercel.com) for automatic deployments.

### Other Platforms

This is a standard Next.js 14 app. Deploy to any platform that supports Next.js:

- [Netlify](https://netlify.com)
- [Railway](https://railway.app)
- [AWS Amplify](https://aws.amazon.com/amplify/)

## Tech Stack

- **Framework**: [Next.js 14](https://nextjs.org/) (App Router)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Blockchain**: [Solana](https://solana.com/)
- **Wallet SDK**: [Lazorkit](https://lazorkit.com/)
- **Language**: TypeScript

## Resources

- [Lazorkit Documentation](https://docs.lazorkit.com/)
- [Lazorkit GitHub](https://github.com/lazor-kit/lazor-kit)
- [Solana Web3.js Docs](https://solana-labs.github.io/solana-web3.js/)
- [SPL Token Documentation](https://spl.solana.com/token)

## License

MIT License - feel free to use this starter for your own projects!

---

Built for the [Lazorkit Bounty](https://docs.lazorkit.com/)
