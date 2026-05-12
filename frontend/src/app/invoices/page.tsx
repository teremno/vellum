"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { InvoiceStatus } from "@/lib/idl";
import { fetchInvoices, getProgram } from "@/lib/program";
import { InvoiceView, normalizeInvoice } from "@/lib/models";
import InvoiceCard from "@/components/InvoiceCard";

const STATUS_FILTERS: Array<{ value: InvoiceStatus | "all"; label: string }> = [
  { value: "all", label: "All" },
  { value: "Draft", label: "Draft" },
  { value: "Pending", label: "Pending" },
  { value: "Paid", label: "Paid" },
  { value: "Overdue", label: "Overdue" },
  { value: "Disputed", label: "Disputed" },
];

export default function InvoicesPage() {
  const wallet = useWallet();
  const router = useRouter();
  const [filter, setFilter] = useState<InvoiceStatus | "all">("all");
  const [search, setSearch] = useState("");
  const [invoices, setInvoices] = useState<InvoiceView[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadInvoices() {
      if (!wallet.connected || !wallet.publicKey) {
        setInvoices([]);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const program = getProgram(wallet);
        if (!program) throw new Error("Wallet cannot sign transactions");

        const accounts = await fetchInvoices(program, wallet.publicKey);
        if (!cancelled) {
          setInvoices(
            accounts.map((item) => normalizeInvoice(item.publicKey, item.account))
          );
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load invoices");
          setInvoices([]);
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    loadInvoices();

    return () => {
      cancelled = true;
    };
  }, [wallet]);

  const filteredInvoices = useMemo(() => {
    let result = invoices;

    if (filter !== "all") {
      result = result.filter((inv) => inv.status === filter);
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (inv) =>
          inv.id.toLowerCase().includes(q) ||
          inv.invoiceId.toLowerCase().includes(q) ||
          inv.payer.toLowerCase().includes(q) ||
          inv.issuer.toLowerCase().includes(q) ||
          inv.currency.toLowerCase().includes(q)
      );
    }

    return result;
  }, [filter, invoices, search]);

  return (
    <div>
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="rounded-lg border border-white/10 bg-slate-800/50 px-3 py-2 text-sm text-slate-400 transition-colors hover:bg-slate-700/50 hover:text-white"
          >
            Back
          </button>
          <div>
            <h1 className="text-3xl font-bold text-white">Invoices</h1>
            <p className="mt-2 text-slate-400">
              Live invoices for your connected Solana wallet
            </p>
          </div>
        </div>
        <Link
          href="/create-invoice"
          className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-purple-500/25 transition-all hover:shadow-xl hover:brightness-110"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          New Invoice
        </Link>
      </div>

      {!wallet.connected ? (
        <div className="flex flex-col items-center gap-4 rounded-xl border border-white/10 bg-slate-800/50 p-12 text-center">
          <p className="text-slate-400">Connect your wallet to load live invoices from Solana devnet.</p>
          <WalletMultiButton />
        </div>
      ) : (
        <>
          {error && (
            <div className="mb-6 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-200">
              {error}
            </div>
          )}

          <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="flex flex-wrap gap-2">
              {STATUS_FILTERS.map((s) => (
                <button
                  key={s.value}
                  onClick={() => setFilter(s.value)}
                  className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                    filter === s.value
                      ? "bg-purple-500/20 text-purple-300 border border-purple-500/30"
                      : "bg-slate-800/50 text-slate-400 border border-white/10 hover:text-white hover:bg-slate-700/50"
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
            <div className="flex-1">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by ID, address, currency..."
                className="w-full rounded-lg border border-white/10 bg-slate-800/50 px-4 py-2 text-sm text-white placeholder-slate-500 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500 sm:max-w-xs"
              />
            </div>
          </div>

          {isLoading ? (
            <div className="rounded-xl border border-white/10 bg-slate-800/50 p-8 text-center text-slate-400">
              Loading invoices from Solana...
            </div>
          ) : filteredInvoices.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <svg className="mb-4 h-16 w-16 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p className="text-lg text-slate-400">No live invoices found</p>
              <p className="mt-1 text-sm text-slate-500">
                Create an invoice with this wallet or adjust your filters.
              </p>
            </div>
          ) : (
            <div className="grid gap-4">
              {filteredInvoices.map((invoice) => (
                <InvoiceCard key={invoice.id} invoice={invoice} />
              ))}
            </div>
          )}

          <div className="mt-4 text-center text-sm text-slate-500">
            Showing {filteredInvoices.length} of {invoices.length} live invoices
          </div>
        </>
      )}
    </div>
  );
}
