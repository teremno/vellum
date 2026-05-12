"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import Link from "next/link";
import { fetchInvoices, getProgram } from "@/lib/program";
import { InvoiceView, normalizeInvoice } from "@/lib/models";
import StatusBadge from "@/components/StatusBadge";

function formatDate(ts: number): string {
  if (!ts) return "Not recorded";
  return new Date(ts * 1000).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

export default function InvoiceDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const wallet = useWallet();
  const [invoice, setInvoice] = useState<InvoiceView | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadInvoice() {
      if (!wallet.connected || !wallet.publicKey) {
        setInvoice(null);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const program = getProgram(wallet);
        if (!program) throw new Error("Wallet cannot sign transactions");

        const accounts = await fetchInvoices(program, wallet.publicKey);
        const normalized = accounts.map((item) =>
          normalizeInvoice(item.publicKey, item.account)
        );
        const match = normalized.find(
          (item) => item.id === id || item.invoiceId === id
        );

        if (!cancelled) setInvoice(match ?? null);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load invoice");
          setInvoice(null);
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    loadInvoice();

    return () => {
      cancelled = true;
    };
  }, [id, wallet]);

  if (!wallet.connected) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center">
        <h2 className="text-xl font-bold text-white">Connect wallet</h2>
        <p className="text-slate-400">Invoice details are loaded live from Solana for the connected wallet.</p>
        <WalletMultiButton />
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="rounded-xl border border-white/10 bg-slate-800/50 p-8 text-center text-slate-400">
        Loading invoice from Solana...
      </div>
    );
  }

  if (error || !invoice) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center">
        <h2 className="text-xl font-bold text-white">Invoice Not Found</h2>
        <p className="max-w-md text-slate-400">
          {error ?? "This invoice is not tied to your connected wallet or does not exist on the configured devnet program."}
        </p>
        <Link href="/invoices" className="text-purple-400 hover:text-purple-300">
          Back to Invoices
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-8">
        <Link href="/invoices" className="mb-2 inline-flex items-center gap-1 text-sm text-slate-400 hover:text-white">
          Back to Invoices
        </Link>
        <h1 className="text-3xl font-bold text-white">
          INV-{invoice.invoiceId.toUpperCase()}
        </h1>
        <div className="mt-2 flex items-center gap-3">
          <StatusBadge status={invoice.status} size="lg" />
          <span className="text-sm text-slate-500">
            Created {formatDate(invoice.createdAt)}
          </span>
        </div>
      </div>

      <div className="rounded-xl border border-white/10 bg-gradient-to-br from-slate-800/80 to-slate-900/80 p-6">
        <div className="grid gap-6 sm:grid-cols-2">
          <div>
            <h3 className="mb-1 text-xs font-medium uppercase tracking-wider text-slate-500">Issuer</h3>
            <p className="break-all font-mono text-sm text-white">{invoice.issuer}</p>
          </div>
          <div>
            <h3 className="mb-1 text-xs font-medium uppercase tracking-wider text-slate-500">Payer</h3>
            <p className="break-all font-mono text-sm text-white">{invoice.payer}</p>
          </div>
          <div>
            <h3 className="mb-1 text-xs font-medium uppercase tracking-wider text-slate-500">Net Amount</h3>
            <p className="text-2xl font-bold text-white">
              {invoice.amount.toLocaleString()} <span className="text-base text-slate-400">{invoice.currency}</span>
            </p>
          </div>
          <div>
            <h3 className="mb-1 text-xs font-medium uppercase tracking-wider text-slate-500">Total</h3>
            <p className="text-2xl font-bold text-green-300">
              {invoice.totalAmount.toLocaleString()} <span className="text-base text-green-400/70">{invoice.currency}</span>
            </p>
          </div>
          <div>
            <h3 className="mb-1 text-xs font-medium uppercase tracking-wider text-slate-500">VAT</h3>
            <p className="text-lg font-semibold text-yellow-300">{invoice.taxRate}%</p>
            <p className="text-sm text-slate-400">
              {invoice.taxAmount.toLocaleString()} {invoice.currency}
            </p>
          </div>
          <div>
            <h3 className="mb-1 text-xs font-medium uppercase tracking-wider text-slate-500">Due Date</h3>
            <p className="text-lg font-semibold text-white">{formatDate(invoice.dueDate)}</p>
          </div>
          <div>
            <h3 className="mb-1 text-xs font-medium uppercase tracking-wider text-slate-500">Issuer VAT ID</h3>
            <p className="font-mono text-sm text-slate-300">{invoice.vatIdIssuer || "Not recorded"}</p>
          </div>
          <div>
            <h3 className="mb-1 text-xs font-medium uppercase tracking-wider text-slate-500">Payer VAT ID</h3>
            <p className="font-mono text-sm text-slate-300">{invoice.vatIdPayer || "Not recorded"}</p>
          </div>
          {invoice.ipfsHash && (
            <div className="sm:col-span-2">
              <h3 className="mb-1 text-xs font-medium uppercase tracking-wider text-slate-500">Invoice PDF IPFS CID</h3>
              <p className="break-all font-mono text-sm text-purple-300">{invoice.ipfsHash}</p>
            </div>
          )}
        </div>
      </div>

      <div className="mt-8 rounded-xl border border-purple-500/20 bg-purple-500/5 p-4">
        <h4 className="text-sm font-semibold text-purple-300">Demo note</h4>
        <p className="mt-1 text-xs leading-relaxed text-slate-400">
          This view is backed by the deployed Anchor program. Payment automation still needs token-account selection in the frontend before it is production-ready.
        </p>
      </div>
    </div>
  );
}
