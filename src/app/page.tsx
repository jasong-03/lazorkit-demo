"use client";

/**
 * Main Demo Page
 *
 * This page demonstrates the core Lazorkit SDK features:
 * 1. Passkey-based wallet connection (no seed phrase)
 * 2. Gasless USDC transfers (paymaster pays gas)
 *
 * The page shows a connect button when disconnected,
 * and wallet info + transfer form when connected.
 */

import { useWallet } from "@lazorkit/wallet";
import { ConnectWallet, WalletInfo, SendUSDC } from "@/components";

export default function Home() {
  const { isConnected } = useWallet();

  return (
    <main className="min-h-screen bg-gray-950">
      {/* Header */}
      <header className="border-b border-gray-800 bg-gray-900/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg" />
            <h1 className="text-xl font-bold text-white">Lazorkit Starter</h1>
          </div>
          <ConnectWallet />
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Hero Section - Show when not connected */}
        {!isConnected && (
          <div className="text-center py-16">
            <h2 className="text-4xl font-bold text-white mb-4">
              Passkey-Powered Solana Wallet
            </h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto mb-8">
              Experience the future of crypto UX. No seed phrases, no browser
              extensions. Just your fingerprint or face.
            </p>

            {/* Feature Cards */}
            <div className="grid md:grid-cols-2 gap-6 mt-12">
              <div className="bg-gray-900 rounded-xl p-6 border border-gray-800 text-left">
                <div className="w-12 h-12 bg-purple-900/50 rounded-lg flex items-center justify-center mb-4">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6 text-purple-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">
                  Passkey Authentication
                </h3>
                <p className="text-gray-400">
                  Sign in with FaceID, TouchID, or Windows Hello. Your
                  biometric stays on your device - never leaves it.
                </p>
              </div>

              <div className="bg-gray-900 rounded-xl p-6 border border-gray-800 text-left">
                <div className="w-12 h-12 bg-green-900/50 rounded-lg flex items-center justify-center mb-4">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6 text-green-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 10V3L4 14h7v7l9-11h-7z"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">
                  Gasless Transactions
                </h3>
                <p className="text-gray-400">
                  No SOL needed for gas. The paymaster sponsors your
                  transactions - you just pay a tiny USDC fee.
                </p>
              </div>
            </div>

            {/* CTA */}
            <div className="mt-12">
              <p className="text-gray-500 mb-4">
                Click the button above to get started
              </p>
            </div>
          </div>
        )}

        {/* Connected State - Show wallet info and transfer form */}
        {isConnected && (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-white mb-2">
                Your Lazorkit Wallet
              </h2>
              <p className="text-gray-400">
                Connected via passkey. Try sending some USDC!
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <WalletInfo />
              <SendUSDC />
            </div>

            {/* Instructions */}
            <div className="bg-gray-900 rounded-xl p-6 border border-gray-800 mt-8">
              <h3 className="text-lg font-semibold text-white mb-4">
                How to Test
              </h3>
              <ol className="list-decimal list-inside space-y-2 text-gray-400">
                <li>
                  Get Devnet USDC from{" "}
                  <a
                    href="https://faucet.circle.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-purple-400 hover:underline"
                  >
                    Circle USDC Faucet
                  </a>
                  {" "}(select Solana Devnet)
                </li>
                <li>Enter a recipient Solana address</li>
                <li>Enter the amount of USDC to send</li>
                <li>Click Send - approve with your passkey</li>
                <li>View the transaction on Solana Explorer</li>
              </ol>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="border-t border-gray-800 mt-auto">
        <div className="max-w-4xl mx-auto px-4 py-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-gray-500 text-sm">
            Built with{" "}
            <a
              href="https://lazorkit.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-purple-400 hover:underline"
            >
              Lazorkit SDK
            </a>{" "}
            for the Lazorkit Bounty
          </p>
          <div className="flex gap-4">
            <a
              href="https://docs.lazorkit.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-white text-sm"
            >
              Docs
            </a>
            <a
              href="https://github.com/lazor-kit/lazor-kit"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-white text-sm"
            >
              GitHub
            </a>
          </div>
        </div>
      </footer>
    </main>
  );
}
