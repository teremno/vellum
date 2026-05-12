import { Idl } from "@coral-xyz/anchor";
import idlJson from "./idl.json";

export const VELLUM_PROGRAM_ID = "GtaC3d2ehX8jayPiTzJwP1vbs5PFbCQ4dkS7GoBw7FDN";
export const vellumIdl: Idl = idlJson as Idl;

// USDC Mint on Solana Devnet
export const USDC_MINT_DEVNET = "4zMMC9srt5Ri5X14GAgXVhP8RkNQ8Q8bKX4Zz3m1e5v2";

// EU VAT rates by country code
export const EU_VAT_RATES: Record<string, { rate: number; name: string }> = {
  DE: { rate: 19, name: "Germany" },
  UA: { rate: 20, name: "Ukraine" },
  ES: { rate: 21, name: "Spain" },
  FR: { rate: 20, name: "France" },
  IT: { rate: 22, name: "Italy" },
  NL: { rate: 21, name: "Netherlands" },
  PL: { rate: 23, name: "Poland" },
  AT: { rate: 20, name: "Austria" },
  BE: { rate: 21, name: "Belgium" },
  CZ: { rate: 21, name: "Czech Republic" },
  PT: { rate: 23, name: "Portugal" },
  SE: { rate: 25, name: "Sweden" },
  DK: { rate: 25, name: "Denmark" },
  FI: { rate: 25.5, name: "Finland" },
  IE: { rate: 23, name: "Ireland" },
  RO: { rate: 19, name: "Romania" },
  HU: { rate: 27, name: "Hungary" },
  BG: { rate: 20, name: "Bulgaria" },
  HR: { rate: 25, name: "Croatia" },
  SK: { rate: 20, name: "Slovakia" },
  SI: { rate: 22, name: "Slovenia" },
  LT: { rate: 21, name: "Lithuania" },
  LV: { rate: 21, name: "Latvia" },
  EE: { rate: 22, name: "Estonia" },
  CY: { rate: 19, name: "Cyprus" },
  LU: { rate: 17, name: "Luxembourg" },
  MT: { rate: 18, name: "Malta" },
  GR: { rate: 24, name: "Greece" },
};

export const CURRENCIES = ["EUR", "USDC"] as const;
export type Currency = (typeof CURRENCIES)[number];

export const INVOICE_STATUSES = ["Draft", "Pending", "Paid", "Overdue", "Disputed"] as const;
export type InvoiceStatus = (typeof INVOICE_STATUSES)[number];

export const INVOICE_STATUS_LABELS: Record<InvoiceStatus, string> = {
  Draft: "Draft",
  Pending: "Pending Payment",
  Paid: "Paid",
  Overdue: "Overdue",
  Disputed: "Disputed",
};

export interface InvoiceAccount {
  invoiceId: string;
  issuer: string;
  payer: string;
  amount: number;
  currency: string;
  taxAmount: number;
  taxRate: number;
  status: InvoiceStatus;
  createdAt: number;
  dueDate: number;
  ipfsHash: string;
  vatIdIssuer: string;
  vatIdPayer: string;
}

export const STATUS_COLORS: Record<InvoiceStatus, string> = {
  Draft: "bg-gray-500/20 text-gray-300 border-gray-500/30",
  Pending: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30",
  Paid: "bg-green-500/20 text-green-300 border-green-500/30",
  Overdue: "bg-red-500/20 text-red-300 border-red-500/30",
  Disputed: "bg-orange-500/20 text-orange-300 border-orange-500/30",
};