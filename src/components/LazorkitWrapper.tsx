"use client";

/**
 * LazorkitWrapper Component
 *
 * Client-side wrapper that provides the Lazorkit context to the application.
 * This component:
 * - Sets up Buffer polyfill required by Solana libraries
 * - Configures LazorkitProvider with Devnet settings
 * - Wraps children with wallet context
 * - Includes error boundary for graceful error handling
 */

import { LazorkitProvider } from "@lazorkit/wallet";
import { LAZORKIT_CONFIG } from "@/lib/constants";
import { ErrorBoundary } from "./ErrorBoundary";

// Import Buffer for polyfill
import { Buffer } from "buffer";

interface LazorkitWrapperProps {
  children: React.ReactNode;
}

// Set up Buffer polyfill immediately (outside component)
if (typeof window !== "undefined") {
  window.Buffer = window.Buffer || Buffer;
}

export function LazorkitWrapper({ children }: LazorkitWrapperProps) {
  return (
    <ErrorBoundary>
      <LazorkitProvider
        rpcUrl={LAZORKIT_CONFIG.RPC_URL}
        portalUrl={LAZORKIT_CONFIG.PORTAL_URL}
        paymasterConfig={LAZORKIT_CONFIG.PAYMASTER}
      >
        {children}
      </LazorkitProvider>
    </ErrorBoundary>
  );
}
