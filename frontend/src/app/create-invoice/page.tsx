"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import TaxCalculator from "@/components/TaxCalculator";
import { getProgram, createInvoiceOnChain } from "@/lib/program";

const CURRENCIES = ["EUR", "USDC"];

export default function CreateInvoicePage() {
  const wallet = useWallet();
  const router = useRouter();
  const { connected, publicKey } = wallet;

  const [payerAddress, setPayerAddress] = useState("");
  const [amount, setAmount] = useState<number>(0);
  const [currency, setCurrency] = useState("EUR");
  const [vatRate, setVatRate] = useState(19);
  const [vatAmount, setVatAmount] = useState(0);
  const [totalAmount, setTotalAmount] = useState(0);
  const [dueDate, setDueDate] = useState("");
  const [ipfsHash, setIpfsHash] = useState("");
  const [description, setDescription] = useState("");
  const [vatIdIssuer, setVatIdIssuer] = useState("");
  const [vatIdPayer, setVatIdPayer] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [txSignature, setTxSignature] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleVatChange = useCallback(
    (rate: number, vat: number, total: number) => {
      setVatRate(rate);
      setVatAmount(vat);
      setTotalAmount(total);
    },
    []
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!connected || !publicKey) return;

    setIsSubmitting(true);
    setError(null);
    setTxSignature(null);

    try {
      const program = getProgram(wallet);
      if (!program) throw new Error("Failed to initialize program connection");

      // Convert date to unix timestamp
      const dueDateTs = Math.floor(new Date(dueDate).getTime() / 1000);

      const signature = await createInvoiceOnChain(
        program,
        payerAddress,
        amount,
        currency,
        vatAmount,
        vatRate,
        dueDateTs,
        ipfsHash || "QmMockHash",
        vatIdIssuer || "DE000000000",
        vatIdPayer || "UA000000000",
        wallet.signTransaction!
      );

      setTxSignature(signature);
    } catch (err: unknown) {
      console.error("Invoice creation error:", err);
      const message = err instanceof Error ? err.message : "Failed to create invoice";
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!connected) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white">Create Invoice</h1>
          <p className="mt-2 text-slate-400">
            Connect your wallet to create an invoice
          </p>
        </div>
        <WalletMultiButton />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">Create Invoice</h1>
        <p className="mt-2 text-slate-400">
          Generate a new B2B invoice on Solana with automated EU VAT calculation
        </p>
      </div>

      {txSignature && (
        <div className="mb-6 rounded-xl border border-green-500/30 bg-green-500/10 p-4">
          <h3 className="font-semibold text-green-300">Invoice Created Successfully!</h3>
          <p className="mt-1 text-sm text-slate-300">
            Transaction:{" "}
            <a
              href={`https://explorer.solana.com/tx/${txSignature}?cluster=devnet`}
              target="_blank"
              rel="noopener noreferrer"
              className="font-mono text-xs text-green-400 underline hover:text-green-300"
            >
              {txSignature.slice(0, 8)}...{txSignature.slice(-8)}
            </a>
          </p>
          <div className="mt-3 flex gap-3">
            <a
              href={`https://explorer.solana.com/tx/${txSignature}?cluster=devnet`}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-lg bg-green-500/20 px-3 py-1.5 text-sm font-medium text-green-300 transition-colors hover:bg-green-500/30"
            >
              View on Explorer →
            </a>
            <button
              onClick={() => { setTxSignature(null); setError(null); }}
              className="rounded-lg bg-slate-700/50 px-3 py-1.5 text-sm font-medium text-slate-300 transition-colors hover:bg-slate-700"
            >
              Create Another
            </button>
            <button
              onClick={() => router.push("/invoices")}
              className="rounded-lg bg-purple-500/20 px-3 py-1.5 text-sm font-medium text-purple-300 transition-colors hover:bg-purple-500/30"
            >
              ← Back to Invoices
            </button>
          </div>
        </div>
      )}

      {error && (
        <div className="mb-6 rounded-xl border border-red-500/30 bg-red-500/10 p-4">
          <h3 className="font-semibold text-red-300">Error</h3>
          <p className="mt-1 text-sm text-slate-300 break-all">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Left column: Invoice details */}
          <div className="space-y-6">
            <div className="rounded-xl border border-white/10 bg-gradient-to-br from-slate-800/80 to-slate-900/80 p-6">
              <h2 className="mb-4 text-lg font-semibold text-white">
                Invoice Details
              </h2>

              <div className="space-y-4">
                {/* Payer address */}
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-300">
                    Payer Wallet Address
                  </label>
                  <input
                    type="text"
                    value={payerAddress}
                    onChange={(e) => setPayerAddress(e.target.value)}
                    placeholder="Enter payer's Solana wallet address"
                    required
                    className="w-full rounded-lg border border-white/10 bg-slate-700/50 px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                  />
                </div>

                {/* Amount and Currency */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="col-span-2">
                    <label className="mb-1.5 block text-sm font-medium text-slate-300">
                      Amount (excl. VAT)
                    </label>
                    <input
                      type="number"
                      value={amount || ""}
                      onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
                      placeholder="0.00"
                      min={0}
                      step={0.01}
                      required
                      className="w-full rounded-lg border border-white/10 bg-slate-700/50 px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-slate-300">
                      Currency
                    </label>
                    <select
                      value={currency}
                      onChange={(e) => setCurrency(e.target.value)}
                      className="w-full rounded-lg border border-white/10 bg-slate-700/50 px-4 py-2.5 text-sm text-white focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                    >
                      {CURRENCIES.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Due Date */}
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-300">
                    Due Date
                  </label>
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    required
                    min={new Date().toISOString().split("T")[0]}
                    className="w-full rounded-lg border border-white/10 bg-slate-700/50 px-4 py-2.5 text-sm text-white focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500 [color-scheme:dark]"
                    lang="en"
                  />
                </div>

                {/* VAT IDs */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-slate-300">
                      Issuer VAT ID
                    </label>
                    <input
                      type="text"
                      value={vatIdIssuer}
                      onChange={(e) => setVatIdIssuer(e.target.value)}
                      placeholder="DE123456789"
                      className="w-full rounded-lg border border-white/10 bg-slate-700/50 px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-slate-300">
                      Payer VAT ID
                    </label>
                    <input
                      type="text"
                      value={vatIdPayer}
                      onChange={(e) => setVatIdPayer(e.target.value)}
                      placeholder="UA987654321"
                      className="w-full rounded-lg border border-white/10 bg-slate-700/50 px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                    />
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-300">
                    Description
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Invoice description or line items..."
                    rows={3}
                    className="w-full rounded-lg border border-white/10 bg-slate-700/50 px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                  />
                </div>

                {/* IPFS Hash */}
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-300">
                    Invoice PDF (IPFS Hash)
                  </label>
                  <input
                    type="text"
                    value={ipfsHash}
                    onChange={(e) => setIpfsHash(e.target.value)}
                    placeholder="Qm... (optional, auto-generated if empty)"
                    className="w-full rounded-lg border border-white/10 bg-slate-700/50 px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                  />
                  <p className="mt-1 text-xs text-slate-500">
                    Upload your invoice PDF to IPFS and paste the CID here
                  </p>
                </div>
              </div>
            </div>

            {/* Issuer info */}
            <div className="rounded-xl border border-white/10 bg-gradient-to-br from-slate-800/80 to-slate-900/80 p-6">
              <h2 className="mb-2 text-sm font-medium text-slate-400">Issuer</h2>
              <p className="font-mono text-sm text-purple-300">
                {publicKey?.toBase58()}
              </p>
            </div>
          </div>

          {/* Right column: Tax calculator + summary */}
          <div className="space-y-6">
            <TaxCalculator
              amount={amount}
              currency={currency}
              onVatChange={handleVatChange}
            />

            {/* Invoice Summary */}
            <div className="rounded-xl border border-white/10 bg-gradient-to-br from-slate-800/80 to-slate-900/80 p-6">
              <h3 className="mb-4 text-lg font-semibold text-white">
                Invoice Summary
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Net Amount</span>
                  <span className="font-mono text-white">
                    {amount.toLocaleString()} {currency}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">VAT ({vatRate}%)</span>
                  <span className="font-mono text-yellow-300">
                    {vatAmount.toLocaleString()} {currency}
                  </span>
                </div>
                <div className="border-t border-white/10 pt-3">
                  <div className="flex justify-between text-base font-semibold">
                    <span className="text-slate-300">Total Due</span>
                    <span className="font-mono text-green-300">
                      {totalAmount.toLocaleString()} {currency}
                    </span>
                  </div>
                </div>
                {currency === "EUR" && (
                  <div className="flex justify-between text-xs text-slate-500">
                    <span>≈ USDC equivalent</span>
                    <span className="font-mono">
                      {totalAmount.toLocaleString()} USDC
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Submit button */}
            <button
              type="submit"
              disabled={isSubmitting || !payerAddress || amount <= 0 || !dueDate}
              className="w-full rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 px-6 py-3.5 text-base font-semibold text-white shadow-lg shadow-purple-500/25 transition-all hover:shadow-xl hover:shadow-purple-500/30 hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-lg disabled:hover:brightness-100"
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Signing Transaction...
                </span>
              ) : (
                "Create Invoice on Solana"
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
