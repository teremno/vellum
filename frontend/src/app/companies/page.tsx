"use client";

import { useEffect, useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { EU_VAT_RATES } from "@/components/TaxCalculator";
import { fetchCompanies, getProgram, registerCompanyOnChain } from "@/lib/program";
import { CompanyView, normalizeCompany } from "@/lib/models";

const COUNTRIES = Object.values(EU_VAT_RATES).sort((a, b) =>
  a.name.localeCompare(b.name)
);

export default function CompaniesPage() {
  const wallet = useWallet();
  const { connected, publicKey } = wallet;
  const [companies, setCompanies] = useState<CompanyView[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [country, setCountry] = useState("DE");
  const [vatNumber, setVatNumber] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [txResult, setTxResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadCompanies() {
      if (!connected) {
        setCompanies([]);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const program = getProgram(wallet);
        if (!program) throw new Error("Wallet cannot sign transactions");

        const accounts = await fetchCompanies(program);
        if (!cancelled) {
          setCompanies(
            accounts.map((item) => normalizeCompany(item.publicKey, item.account))
          );
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load companies");
          setCompanies([]);
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    loadCompanies();

    return () => {
      cancelled = true;
    };
  }, [connected, wallet]);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!connected || !publicKey) return;

    setIsRegistering(true);
    setError(null);

    try {
      const program = getProgram(wallet);
      if (!program || !wallet.signTransaction) {
        throw new Error("Wallet cannot sign transactions");
      }

      const signature = await registerCompanyOnChain(
        program,
        name,
        vatNumber,
        country,
        publicKey,
        wallet.signTransaction
      );

      setCompanies((current) => [
        ...current,
        {
          id: publicKey.toBase58(),
          authority: publicKey.toBase58(),
          name,
          country,
          vatNumber,
          wallet: publicKey.toBase58(),
          registeredAt: Math.floor(Date.now() / 1000),
        },
      ]);
      setTxResult(signature);
      setName("");
      setCountry("DE");
      setVatNumber("");
      setShowForm(false);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setIsRegistering(false);
    }
  };

  return (
    <div>
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Companies</h1>
          <p className="mt-2 text-slate-400">
            Register and load company profiles from Solana devnet
          </p>
        </div>
        {connected && (
          <button
            onClick={() => setShowForm(!showForm)}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-purple-500/25 transition-all hover:shadow-xl hover:brightness-110"
          >
            {showForm ? (
              "Cancel"
            ) : (
              <>
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Register Company
              </>
            )}
          </button>
        )}
      </div>

      {/* Transaction result */}
      {txResult && (
        <div className="mb-6 rounded-xl border border-green-500/30 bg-green-500/10 p-4">
          <h3 className="font-semibold text-green-300">Company Registered Successfully!</h3>
          <p className="mt-1 text-sm text-slate-300">
            Transaction:{" "}
            <a
              href={`https://explorer.solana.com/tx/${txResult}?cluster=devnet`}
              target="_blank"
              rel="noopener noreferrer"
              className="font-mono text-xs text-green-400 underline hover:text-green-300"
            >
              {txResult.slice(0, 8)}...{txResult.slice(-8)}
            </a>
          </p>
          <button
            onClick={() => setTxResult(null)}
            className="mt-2 text-sm text-purple-400 hover:text-purple-300"
          >
            Dismiss
          </button>
        </div>
      )}

      {error && (
        <div className="mb-6 rounded-xl border border-red-500/30 bg-red-500/10 p-4">
          <h3 className="font-semibold text-red-300">Error</h3>
          <p className="mt-1 text-sm text-slate-300">{error}</p>
        </div>
      )}

      {/* Registration form */}
      {showForm && connected && (
        <div className="mb-8 rounded-xl border border-white/10 bg-gradient-to-br from-slate-800/80 to-slate-900/80 p-6">
          <h2 className="mb-4 text-lg font-semibold text-white">
            Register Your Company
          </h2>
          <form onSubmit={handleRegister} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-300">
                  Company Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Vellum GmbH"
                  required
                  className="w-full rounded-lg border border-white/10 bg-slate-700/50 px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-300">
                  Country
                </label>
                <select
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  className="w-full rounded-lg border border-white/10 bg-slate-700/50 px-4 py-2.5 text-sm text-white focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                >
                  {COUNTRIES.map((c) => (
                    <option key={c.code} value={c.code}>
                      {c.name} ({c.code}) — {c.rate}% VAT
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-300">
                  VAT Number
                </label>
                <input
                  type="text"
                  value={vatNumber}
                  onChange={(e) => setVatNumber(e.target.value)}
                  placeholder="e.g. DE123456789"
                  required
                  className="w-full rounded-lg border border-white/10 bg-slate-700/50 px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-300">
                  Wallet Address
                </label>
                <input
                  type="text"
                  value={publicKey?.toBase58() || ""}
                  readOnly
                  className="w-full rounded-lg border border-white/10 bg-slate-700/30 px-4 py-2.5 text-sm text-slate-400"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isRegistering || !name || !vatNumber}
              className="rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-purple-500/25 transition-all hover:shadow-xl hover:brightness-110 disabled:opacity-50"
            >
              {isRegistering ? "Registering..." : "Register on Solana"}
            </button>
          </form>
        </div>
      )}

      {!connected && (
        <div className="mb-8 flex flex-col items-center gap-4 rounded-xl border border-white/10 bg-slate-800/50 p-12 text-center">
          <p className="text-slate-400">Connect your wallet to register a company</p>
          <WalletMultiButton />
        </div>
      )}

      {/* Companies list */}
      <div className="space-y-4">
        {isLoading && (
          <div className="rounded-xl border border-white/10 bg-slate-800/50 p-8 text-center text-slate-400">
            Loading companies from Solana...
          </div>
        )}

        {!isLoading && connected && companies.length === 0 && (
          <div className="rounded-xl border border-white/10 bg-slate-800/50 p-8 text-center text-slate-400">
            No on-chain company profiles found yet.
          </div>
        )}

        {!isLoading && companies.map((company) => {
          const countryInfo = EU_VAT_RATES[company.country];
          return (
            <div
              key={company.id}
              className="rounded-xl border border-white/10 bg-gradient-to-br from-slate-800/80 to-slate-900/80 p-5"
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-purple-500 to-blue-500 text-sm font-bold text-white">
                      {company.name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-semibold text-white">{company.name}</h3>
                      <p className="text-sm text-slate-400">
                        {countryInfo?.name || company.country} · VAT Rate:{" "}
                        <span className="text-yellow-300">{countryInfo?.rate || "N/A"}%</span>
                      </p>
                    </div>
                  </div>
                </div>
                <div className="space-y-1 text-sm">
                  <p>
                    <span className="text-slate-500">VAT:</span>{" "}
                    <span className="font-mono text-slate-300">{company.vatNumber}</span>
                  </p>
                  <p>
                    <span className="text-slate-500">Wallet:</span>{" "}
                    <span className="font-mono text-purple-300">
                      {company.wallet.slice(0, 8)}...{company.wallet.slice(-4)}
                    </span>
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-4 text-center text-sm text-slate-500">
        {companies.length} live company profiles
      </div>
    </div>
  );
}
