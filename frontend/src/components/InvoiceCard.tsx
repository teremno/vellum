import { InvoiceView } from "@/lib/models";
import StatusBadge from "./StatusBadge";
import Link from "next/link";

interface InvoiceCardProps {
  invoice: InvoiceView;
}

function shortenAddress(addr: string): string {
  if (!addr || addr.length < 12) return addr;
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}

function formatDate(ts: number): string {
  return new Date(ts * 1000).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default function InvoiceCard({ invoice }: InvoiceCardProps) {
  return (
    <Link href={`/invoices/${invoice.id}`}>
      <div className="group relative overflow-hidden rounded-xl border border-white/10 bg-gradient-to-br from-slate-800/80 to-slate-900/80 p-5 backdrop-blur-sm transition-all duration-300 hover:border-purple-500/40 hover:shadow-lg hover:shadow-purple-500/10">
        {/* Decorative gradient line */}
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-purple-500/50 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />

        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-3">
              <h3 className="truncate text-base font-semibold text-white">
                INV-{invoice.id.slice(0, 8).toUpperCase()}
              </h3>
              <StatusBadge status={invoice.status} size="sm" />
            </div>
            <div className="mt-2 space-y-1 text-sm text-slate-400">
              <p>
                Payer:{" "}
                <span className="font-mono text-slate-300">
                  {shortenAddress(invoice.payer)}
                </span>
              </p>
              <p>
                Issuer:{" "}
                <span className="font-mono text-slate-300">
                  {shortenAddress(invoice.issuer)}
                </span>
              </p>
            </div>
          </div>

          <div className="text-right">
            <p className="text-lg font-bold text-white">
              {invoice.totalAmount.toLocaleString()}{" "}
              <span className="text-sm text-slate-400">{invoice.currency}</span>
            </p>
            <p className="mt-1 text-xs text-slate-500">
              Due {formatDate(invoice.dueDate)}
            </p>
          </div>
        </div>

        <div className="mt-3 flex items-center gap-4 border-t border-white/5 pt-3 text-xs text-slate-500">
          <span>
            Net: {invoice.amount.toLocaleString()} {invoice.currency}
          </span>
          <span>•</span>
          <span>VAT: {invoice.taxRate}% ({invoice.taxAmount.toLocaleString()})</span>
          <span>•</span>
          <span>Created {formatDate(invoice.createdAt)}</span>
        </div>
      </div>
    </Link>
  );
}
