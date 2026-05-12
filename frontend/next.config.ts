import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Prevent SSR of packages that reference browser-only globals at import time.
  // @solana/web3.js and related packages use Buffer, window.crypto, etc.
  serverExternalPackages: [
    "@solana/web3.js",
    "@coral-xyz/anchor",
    "@solana/wallet-adapter-react",
    "@solana/wallet-adapter-react-ui",
    "@solana/wallet-adapter-phantom",
    "@solana/wallet-adapter-base",
  ],
};

export default nextConfig;
