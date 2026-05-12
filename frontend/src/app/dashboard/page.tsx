"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { fetchInvoices, getProgram } from "@/lib/program";
import { InvoiceView, normalizeInvoice } from "@/lib/models";
import { InvoiceStatus } from "@/lib/idl";

const STATUS_COLORS: Record<InvoiceStatus, string> = {
  Draft: "#94a3b8",
  Pending: "#facc15",
  Paid: "#4ade80",
  Overdue: "#f87171",
  Disputed: "#fb923c",
};

function monthLabel(timestamp: number): string {
  return new Date(timestamp * 1000).toLocaleDateString("en-US", { month: "short" });
}

export default function DashboardPage() {
  const wallet = useWallet();
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
          setError(err instanceof Error ? err.message : "Failed to load dashboard data");
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

  const stats = useMemo(() => {
    const byStatus = invoices.reduce<Record<InvoiceStatus, number>>(
      (acc, invoice) => {
        acc[invoice.status] += 1;
        return acc;
      },
      { Draft: 0, Pending: 0, Paid: 0, Overdue: 0, Disputed: 0 }
    );

    return {
      totalInvoices: invoices.length,
      paidAmount: invoices
        .filter((invoice) => invoice.status === "Paid")
        .reduce((sum, invoice) => sum + invoice.totalAmount, 0),
      pendingAmount: invoices
        .filter((invoice) => invoice.status === "Pending")
        .reduce((sum, invoice) => sum + invoice.totalAmount, 0),
      overdueAmount: invoices
        .filter((invoice) => invoice.status === "Overdue")
        .reduce((sum, invoice) => sum + invoice.totalAmount, 0),
      vatAmount: invoices.reduce((sum, invoice) => sum + invoice.taxAmount, 0),
      byStatus,
    };
  }, [invoices]);

  const monthlyData = useMemo(() => {
    const grouped = new Map<string, { month: string; invoices: number; amount: number }>();

    for (const invoice of invoices) {
      const key = invoice.createdAt ? monthLabel(invoice.createdAt) : "Unknown";
      const current = grouped.get(key) ?? { month: key, invoices: 0, amount: 0 };
      current.invoices += 1;
      current.amount += invoice.totalAmount;
      grouped.set(key, current);
    }

    return Array.from(grouped.values());
  }, [invoices]);

  const pieData = useMemo(
    () =>
      Object.entries(stats.byStatus)
        .filter(([, value]) => value > 0)
        .map(([name, value]) => ({
          name,
          value,
          color: STATUS_COLORS[name as InvoiceStatus],
        })),
    [stats.byStatus]
  );

  const statCards = [
    { label: "Live Invoices", value: stats.totalInvoices.toLocaleString(), color: "text-purple-300" },
    { label: "Paid", value: `${stats.paidAmount.toLocaleString()} total`, color: "text-green-300" },
    { label: "Pending", value: `${stats.pendingAmount.toLocaleString()} total`, color: "text-yellow-300" },
    { label: "Overdue", value: `${stats.overdueAmount.toLocaleString()} total`, color: "text-red-300" },
    { label: "VAT Tracked", value: `${stats.vatAmount.toLocaleString()} total`, color: "text-blue-300" },
  ];

  return (
    <div>
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Dashboard</h1>
          <p className="mt-2 text-slate-400">
            Live overview of invoices tied to your connected wallet
          </p>
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
        <div className="mb-8 flex flex-col items-center gap-4 rounded-xl border border-white/10 bg-slate-800/50 p-12 text-center">
          <p className="text-slate-400">Connect your wallet to load live dashboard data from Solana devnet.</p>
          <WalletMultiButton />
        </div>
      ) : (
        <>
          {error && (
            <div className="mb-6 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-200">
              {error}
            </div>
          )}

          <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {statCards.map((stat) => (
              <div
                key={stat.label}
                className="rounded-xl border border-white/10 bg-gradient-to-br from-slate-800/80 to-slate-900/80 p-5"
              >
                <p className="text-xs text-slate-500">{stat.label}</p>
                <p className={`mt-2 text-lg font-bold ${stat.color}`}>
                  {isLoading ? "Loading..." : stat.value}
                </p>
              </div>
            ))}
          </div>

          <div className="mb-8 grid gap-6 lg:grid-cols-2">
            <div className="rounded-xl border border-white/10 bg-gradient-to-br from-slate-800/80 to-slate-900/80 p-6">
              <h3 className="mb-4 text-base font-semibold text-white">
                Monthly Invoice Volume
              </h3>
              <div className="h-64">
                {monthlyData.length === 0 ? (
                  <div className="flex h-full items-center justify-center text-sm text-slate-500">
                    No invoice history yet
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={monthlyData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                      <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} />
                      <YAxis stroke="#94a3b8" fontSize={12} />
                      <Tooltip contentStyle={{ backgroundColor: "#1e293b", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", color: "#fff" }} />
                      <Bar dataKey="amount" fill="#8b5cf6" radius={[4, 4, 0, 0]} name="Amount" />
                      <Bar dataKey="invoices" fill="#06b6d4" radius={[4, 4, 0, 0]} name="Invoices" />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>

            <div className="rounded-xl border border-white/10 bg-gradient-to-br from-slate-800/80 to-slate-900/80 p-6">
              <h3 className="mb-4 text-base font-semibold text-white">
                Invoice Status Distribution
              </h3>
              <div className="h-64">
                {pieData.length === 0 ? (
                  <div className="flex h-full items-center justify-center text-sm text-slate-500">
                    No status data yet
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={2} dataKey="value">
                        {pieData.map((entry) => (
                          <Cell key={entry.name} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ backgroundColor: "#1e293b", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", color: "#fff" }} />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>
          </div>
        </>
      )}

      <div className="grid gap-4 sm:grid-cols-3">
        <Link href="/create-invoice" className="group rounded-xl border border-white/10 bg-gradient-to-br from-slate-800/50 to-slate-900/50 p-6 transition-all hover:border-purple-500/30">
          <h3 className="font-semibold text-white">Create Invoice</h3>
          <p className="mt-1 text-sm text-slate-400">Generate a new B2B invoice with auto VAT</p>
        </Link>
        <Link href="/invoices" className="group rounded-xl border border-white/10 bg-gradient-to-br from-slate-800/50 to-slate-900/50 p-6 transition-all hover:border-blue-500/30">
          <h3 className="font-semibold text-white">View Invoices</h3>
          <p className="mt-1 text-sm text-slate-400">Browse live on-chain invoices for your wallet</p>
        </Link>
        <Link href="/companies" className="group rounded-xl border border-white/10 bg-gradient-to-br from-slate-800/50 to-slate-900/50 p-6 transition-all hover:border-green-500/30">
          <h3 className="font-semibold text-white">Companies</h3>
          <p className="mt-1 text-sm text-slate-400">Register and inspect company profiles</p>
        </Link>
      </div>
    </div>
  );
}
