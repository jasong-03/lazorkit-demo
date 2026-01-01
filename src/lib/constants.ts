/**
 * Lazorkit SDK Configuration
 *
 * These are the default Devnet configuration values from the Lazorkit documentation.
 * For production, you would update these to mainnet endpoints.
 */

export const LAZORKIT_CONFIG = {
  // Solana Devnet RPC endpoint
  RPC_URL: process.env.NEXT_PUBLIC_RPC_URL || "https://api.devnet.solana.com",

  // Lazorkit Portal URL for passkey authentication
  PORTAL_URL: process.env.NEXT_PUBLIC_PORTAL_URL || "https://portal.lazor.sh",

  // Paymaster configuration for gasless transactions
  PAYMASTER: {
    paymasterUrl: process.env.NEXT_PUBLIC_PAYMASTER_URL || "https://kora.devnet.lazorkit.com"
  }
} as const;

/**
 * Devnet USDC Token Mint Address
 * This is the official USDC mint on Solana Devnet
 */
export const USDC_MINT_DEVNET = "4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU";

/**
 * Solana Explorer base URL for transaction links
 */
export const EXPLORER_URL = "https://explorer.solana.com";

/**
 * Get explorer URL for a transaction signature
 */
export function getExplorerTxUrl(signature: string, cluster: "devnet" | "mainnet-beta" = "devnet"): string {
  return `${EXPLORER_URL}/tx/${signature}?cluster=${cluster}`;
}

/**
 * Get explorer URL for an account/address
 */
export function getExplorerAddressUrl(address: string, cluster: "devnet" | "mainnet-beta" = "devnet"): string {
  return `${EXPLORER_URL}/address/${address}?cluster=${cluster}`;
}

/**
 * Truncate address for display (e.g., "AbCd...WxYz")
 */
export function truncateAddress(address: string, chars: number = 4): string {
  if (address.length <= chars * 2 + 3) return address;
  return `${address.slice(0, chars)}...${address.slice(-chars)}`;
}
