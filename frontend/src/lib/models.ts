import { PublicKey } from "@solana/web3.js";
import { BN } from "@coral-xyz/anchor";
import { InvoiceStatus } from "./idl";

const ACCOUNTING_AMOUNT_SCALE = 100;

export interface InvoiceView {
  id: string;
  invoiceId: string;
  issuer: string;
  payer: string;
  amount: number;
  currency: string;
  taxRate: number;
  taxAmount: number;
  totalAmount: number;
  dueDate: number;
  status: InvoiceStatus;
  ipfsHash: string;
  vatIdIssuer: string;
  vatIdPayer: string;
  createdAt: number;
  paidAt: number | null;
  disputedAt: number | null;
}

export interface CompanyView {
  id: string;
  authority: string;
  name: string;
  country: string;
  vatNumber: string;
  wallet: string;
  registeredAt: number | null;
}

type RawInvoiceStatus =
  | InvoiceStatus
  | { draft?: unknown; pending?: unknown; paid?: unknown; overdue?: unknown; disputed?: unknown };

type RawAccount = Record<string, unknown>;

export function toNumber(value: BN | number | bigint | string | unknown): number {
  if (value === undefined) return 0;
  if (BN.isBN(value)) return value.toNumber();
  if (typeof value === "bigint") return Number(value);
  if (typeof value === "string") return Number(value);
  if (typeof value === "number") return value;
  return 0;
}

function toStringValue(value: unknown): string {
  return typeof value === "string" ? value : "";
}

function toPublicKey(value: unknown): PublicKey {
  if (value instanceof PublicKey) return value;
  if (typeof value === "string") return new PublicKey(value);
  return PublicKey.default;
}

export function normalizeInvoiceStatus(status: RawInvoiceStatus): InvoiceStatus {
  if (typeof status === "string") return status;
  if (!status) return "Pending";
  if ("draft" in status) return "Draft";
  if ("paid" in status) return "Paid";
  if ("overdue" in status) return "Overdue";
  if ("disputed" in status) return "Disputed";
  return "Pending";
}

export function normalizeInvoice(publicKey: PublicKey, account: RawAccount): InvoiceView {
  const amount = toNumber(account.amount);
  const taxAmount = toNumber(account.taxAmount ?? account.tax_amount);
  const displayAmount = amount / ACCOUNTING_AMOUNT_SCALE;
  const displayTaxAmount = taxAmount / ACCOUNTING_AMOUNT_SCALE;
  const invoiceId =
    toStringValue(account.invoiceId) ||
    toStringValue(account.invoice_id) ||
    publicKey.toBase58();
  const issuer = toPublicKey(account.issuer);
  const payer = toPublicKey(account.payer);

  return {
    id: publicKey.toBase58(),
    invoiceId,
    issuer: issuer.toBase58(),
    payer: payer.toBase58(),
    amount: displayAmount,
    currency: toStringValue(account.currency),
    taxRate: toNumber(account.taxRate ?? account.tax_rate),
    taxAmount: displayTaxAmount,
    totalAmount: displayAmount + displayTaxAmount,
    dueDate: toNumber(account.dueDate ?? account.due_date),
    status: normalizeInvoiceStatus(account.status as RawInvoiceStatus),
    ipfsHash: toStringValue(account.ipfsHash) || toStringValue(account.ipfs_hash),
    vatIdIssuer: toStringValue(account.vatIdIssuer) || toStringValue(account.vat_id_issuer),
    vatIdPayer: toStringValue(account.vatIdPayer) || toStringValue(account.vat_id_payer),
    createdAt: toNumber(account.createdAt ?? account.created_at),
    paidAt: null,
    disputedAt: null,
  };
}

export function normalizeCompany(publicKey: PublicKey, account: RawAccount): CompanyView {
  const authority = toPublicKey(account.authority);
  const walletAddress = toPublicKey(account.walletAddress ?? account.wallet_address ?? account.authority);

  return {
    id: publicKey.toBase58(),
    authority: authority.toBase58(),
    name: toStringValue(account.name),
    country: toStringValue(account.country),
    vatNumber: toStringValue(account.vatId) || toStringValue(account.vat_id),
    wallet: walletAddress.toBase58(),
    registeredAt: null,
  };
}
