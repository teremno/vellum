"use client";

import { Suspense } from "react";
import dynamic from "next/dynamic";
import { I18nProvider } from "@/lib/i18n";

// ssr: false ensures @solana/* packages never run on the server.
// These packages reference browser-only globals (window, crypto, Buffer)
// at module evaluation time — Next.js Turbopack SSR cannot handle them.
const WalletContextProvider = dynamic(
  () => import("@/components/WalletContextProvider"),
  {
    ssr: false,
    loading: () => null,
  }
);

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <I18nProvider>
      <Suspense fallback={null}>
        <WalletContextProvider>{children}</WalletContextProvider>
      </Suspense>
    </I18nProvider>
  );
}
