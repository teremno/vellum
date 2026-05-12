"use client";

import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import Link from "next/link";

const FEATURES = [
  {
    title: "Create Invoices",
    description:
      "Generate professional B2B invoices on-chain with full transparency and immutability.",
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
    gradient: "from-purple-500 to-indigo-500",
  },
  {
    title: "Pay with USDC",
    description:
      "Settle invoices instantly using USDC stablecoin on Solana — fast, cheap, borderless.",
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    gradient: "from-green-500 to-emerald-500",
  },
  {
    title: "Auto-calculate EU VAT",
    description:
      "Built-in EU VAT calculator with all 27 member state rates. ViDA-compliant by design.",
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
      </svg>
    ),
    gradient: "from-yellow-500 to-orange-500",
  },
  {
    title: "Compliance-ready",
    description:
      "Real-time digital reporting aligned with the EU ViDA directive and 2028 e-invoicing mandate.",
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
    gradient: "from-blue-500 to-cyan-500",
  },
];

export default function HomePage() {
  const { connected, publicKey } = useWallet();

  return (
    <div className="relative">
      {/* Hero background effects */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 h-96 w-96 rounded-full bg-purple-500/10 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-blue-500/10 blur-3xl" />
        <div className="absolute top-1/2 left-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-indigo-500/5 blur-3xl" />
      </div>

      <div className="relative">
        {/* Hero Section */}
        <section className="flex flex-col items-center justify-center py-20 text-center lg:py-32">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-purple-500/30 bg-purple-500/10 px-4 py-1.5 text-sm text-purple-300">
            <span className="h-2 w-2 animate-pulse rounded-full bg-purple-400" />
            Built on Solana · Powered by ViDA
          </div>

          <h1 className="max-w-4xl text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
            <span className="bg-gradient-to-r from-white via-purple-200 to-blue-200 bg-clip-text text-transparent">
              B2B Invoicing on Solana
            </span>
            <br />
            <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
              with ViDA Tax Automation
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-400 leading-relaxed">
            Create, send, and settle cross-border B2B invoices with automated EU VAT
            calculation. Compliant with the ViDA directive and ready for the 2028
            e-invoicing mandate.
          </p>

          <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row">
            {connected ? (
              <>
                <Link
                  href="/create-invoice"
                  className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 px-8 py-3.5 text-base font-semibold text-white shadow-lg shadow-purple-500/25 transition-all hover:shadow-xl hover:shadow-purple-500/30 hover:brightness-110"
                >
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Create Invoice
                </Link>
                <Link
                  href="/dashboard"
                  className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-8 py-3.5 text-base font-semibold text-white backdrop-blur-sm transition-all hover:bg-white/10"
                >
                  Dashboard
                </Link>
              </>
            ) : (
              <div className="flex flex-col items-center gap-3">
                <WalletMultiButton />
                <p className="text-sm text-slate-500">
                  Connect your Solana wallet to get started
                </p>
              </div>
            )}
          </div>

          {connected && publicKey && (
            <p className="mt-4 text-sm text-slate-500">
              Connected:{" "}
              <span className="font-mono text-purple-300">
                {publicKey.toBase58().slice(0, 8)}...
                {publicKey.toBase58().slice(-4)}
              </span>
            </p>
          )}
        </section>

        {/* Features Grid */}
        <section className="py-16">
          <div className="mb-12 text-center">
            <h2 className="text-2xl font-bold text-white sm:text-3xl">
              Everything you need for cross-border invoicing
            </h2>
            <p className="mt-3 text-slate-400">
              Built for the future of EU digital tax compliance
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {FEATURES.map((feature) => (
              <div
                key={feature.title}
                className="group relative overflow-hidden rounded-xl border border-white/10 bg-gradient-to-br from-slate-800/50 to-slate-900/50 p-6 backdrop-blur-sm transition-all duration-300 hover:border-white/20 hover:shadow-lg"
              >
                <div
                  className={`mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br ${feature.gradient} text-white shadow-lg`}
                >
                  {feature.icon}
                </div>
                <h3 className="mb-2 text-lg font-semibold text-white">
                  {feature.title}
                </h3>
                <p className="text-sm leading-relaxed text-slate-400">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-16">
          <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-slate-800/30 to-slate-900/30 p-8">
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
              <div className="text-center">
                <p className="text-3xl font-bold text-white">27</p>
                <p className="mt-1 text-sm text-slate-400">EU VAT Rates Supported</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-white">&lt;1s</p>
                <p className="mt-1 text-sm text-slate-400">Invoice Settlement</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-white">$0.001</p>
                <p className="mt-1 text-sm text-slate-400">Avg Transaction Fee</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-white">2028</p>
                <p className="mt-1 text-sm text-slate-400">ViDA Compliance Ready</p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16 text-center">
          <div className="rounded-2xl border border-purple-500/20 bg-gradient-to-br from-purple-900/20 to-blue-900/20 p-12">
            <h2 className="text-2xl font-bold text-white sm:text-3xl">
              Ready to modernize your invoicing?
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-slate-400">
              Join the future of B2B payments on Solana. Create your first invoice in
              under 60 seconds.
            </p>
            <div className="mt-8">
              {connected ? (
                <Link
                  href="/create-invoice"
                  className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 px-8 py-3.5 text-base font-semibold text-white shadow-lg shadow-purple-500/25 transition-all hover:shadow-xl hover:shadow-purple-500/30 hover:brightness-110"
                >
                  Get Started
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </Link>
              ) : (
                <WalletMultiButton />
              )}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}