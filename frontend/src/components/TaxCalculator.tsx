"use client";

import { useEffect, useMemo, useState } from "react";

// EU VAT rates as of 2025
const EU_VAT_RATES: Record<string, { rate: number; code: string; name: string }> = {
  AT: { rate: 20, code: "AT", name: "Austria" },
  BE: { rate: 21, code: "BE", name: "Belgium" },
  BG: { rate: 20, code: "BG", name: "Bulgaria" },
  HR: { rate: 25, code: "HR", name: "Croatia" },
  CY: { rate: 19, code: "CY", name: "Cyprus" },
  CZ: { rate: 21, code: "CZ", name: "Czech Republic" },
  DE: { rate: 19, code: "DE", name: "Germany" },
  DK: { rate: 25, code: "DK", name: "Denmark" },
  EE: { rate: 22, code: "EE", name: "Estonia" },
  ES: { rate: 21, code: "ES", name: "Spain" },
  FI: { rate: 25.5, code: "FI", name: "Finland" },
  FR: { rate: 20, code: "FR", name: "France" },
  GR: { rate: 24, code: "GR", name: "Greece" },
  HU: { rate: 27, code: "HU", name: "Hungary" },
  IE: { rate: 23, code: "IE", name: "Ireland" },
  IT: { rate: 22, code: "IT", name: "Italy" },
  LT: { rate: 21, code: "LT", name: "Lithuania" },
  LU: { rate: 17, code: "LU", name: "Luxembourg" },
  LV: { rate: 21, code: "LV", name: "Latvia" },
  MT: { rate: 18, code: "MT", name: "Malta" },
  NL: { rate: 21, code: "NL", name: "Netherlands" },
  PL: { rate: 23, code: "PL", name: "Poland" },
  PT: { rate: 23, code: "PT", name: "Portugal" },
  RO: { rate: 19, code: "RO", name: "Romania" },
  SE: { rate: 25, code: "SE", name: "Sweden" },
  SI: { rate: 22, code: "SI", name: "Slovenia" },
  SK: { rate: 20, code: "SK", name: "Slovakia" },
  UA: { rate: 20, code: "UA", name: "Ukraine" },
  GB: { rate: 20, code: "GB", name: "United Kingdom" },
};

interface TaxCalculatorProps {
  amount: number;
  currency: string;
  onVatChange: (vatRate: number, vatAmount: number, totalAmount: number) => void;
}

export default function TaxCalculator({
  amount,
  currency,
  onVatChange,
}: TaxCalculatorProps) {
  const [selectedCountry, setSelectedCountry] = useState<string>("DE");
  const [customRate, setCustomRate] = useState<number>(19);
  const [useCustom, setUseCustom] = useState(false);

  const countries = useMemo(
    () => Object.values(EU_VAT_RATES).sort((a, b) => a.name.localeCompare(b.name)),
    []
  );

  const currentRate = useCustom ? customRate : EU_VAT_RATES[selectedCountry]?.rate ?? 0;
  const vatAmount = Math.round(amount * (currentRate / 100) * 100) / 100;
  const totalAmount = Math.round((amount + vatAmount) * 100) / 100;

  // Notify parent whenever rate changes.
  useEffect(() => {
    onVatChange(currentRate, vatAmount, totalAmount);
  }, [currentRate, vatAmount, totalAmount, onVatChange]);

  return (
    <div className="rounded-xl border border-white/10 bg-gradient-to-br from-slate-800/60 to-slate-900/60 p-5">
      <h3 className="mb-4 flex items-center gap-2 text-base font-semibold text-white">
        <svg className="h-5 w-5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
        EU VAT Calculator
        <span className="ml-1 rounded bg-purple-500/20 px-2 py-0.5 text-xs text-purple-300">
          ViDA Ready
        </span>
      </h3>

      <div className="space-y-4">
        {/* Country selector */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-300">
            EU Member State
          </label>
          <select
            value={selectedCountry}
            onChange={(e) => {
              setSelectedCountry(e.target.value);
              setUseCustom(false);
            }}
            disabled={useCustom}
            className="w-full rounded-lg border border-white/10 bg-slate-700/50 px-3 py-2.5 text-sm text-white focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500 disabled:opacity-50"
          >
            {countries.map((c) => (
              <option key={c.code} value={c.code}>
                {c.name} — {c.rate}%
              </option>
            ))}
          </select>
        </div>

        {/* Toggle custom rate */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setUseCustom(!useCustom)}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
              useCustom
                ? "bg-purple-500/20 text-purple-300 border border-purple-500/30"
                : "bg-slate-700/50 text-slate-400 border border-white/10"
            }`}
          >
            Custom Rate
          </button>
          {useCustom && (
            <div className="flex items-center gap-2">
              <input
                type="number"
                min={0}
                max={100}
                step={0.5}
                value={customRate}
                onChange={(e) => setCustomRate(parseFloat(e.target.value) || 0)}
                className="w-20 rounded-lg border border-white/10 bg-slate-700/50 px-3 py-1.5 text-sm text-white focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
              />
              <span className="text-sm text-slate-400">%</span>
            </div>
          )}
        </div>

        {/* Calculation breakdown */}
        <div className="space-y-2 rounded-lg bg-slate-900/50 p-4">
          <div className="flex justify-between text-sm">
            <span className="text-slate-400">Net Amount</span>
            <span className="font-mono text-white">
              {amount.toLocaleString()} {currency}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-slate-400">VAT Rate</span>
            <span className="font-mono text-purple-300">{currentRate}%</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-slate-400">VAT Amount</span>
            <span className="font-mono text-yellow-300">
              {vatAmount.toLocaleString()} {currency}
            </span>
          </div>
          <div className="border-t border-white/10 pt-2">
            <div className="flex justify-between text-sm font-semibold">
              <span className="text-slate-300">Total (incl. VAT)</span>
              <span className="font-mono text-green-300">
                {totalAmount.toLocaleString()} {currency}
              </span>
            </div>
          </div>
        </div>

        {/* ViDA compliance note */}
        <p className="text-xs text-slate-500 leading-relaxed">
          💡 Under the EU ViDA (VAT in the Digital Age) directive, real-time digital
          invoicing with automated VAT calculation ensures compliance with the 2028
          e-invoicing mandate.
        </p>
      </div>
    </div>
  );
}

export { EU_VAT_RATES };
