"use client";

import React, { useMemo } from "react";
import {
  ConnectionProvider,
  WalletProvider,
} from "@solana/wallet-adapter-react";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import { PhantomWalletAdapter } from "@solana/wallet-adapter-phantom";
import { ENDPOINT } from "@/lib/connection";

// Import wallet adapter styles
import "@solana/wallet-adapter-react-ui/styles.css";

interface WalletContextProps {
  children: React.ReactNode;
}

export default function WalletContextProvider({ children }: WalletContextProps) {
  const endpoint = useMemo(() => ENDPOINT, []);

  const wallets = useMemo(
    () => [
      new PhantomWalletAdapter(),
    ],
    []
  );

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>{children}</WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}
