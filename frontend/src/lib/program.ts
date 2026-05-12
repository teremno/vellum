"use client";

import {
  Connection,
  PublicKey,
  SystemProgram,
  Transaction,
  VersionedTransaction,
  type TransactionSignature,
} from "@solana/web3.js";
import { Program, AnchorProvider, Idl, BN } from "@coral-xyz/anchor";
import type { Wallet } from "@coral-xyz/anchor/dist/esm/provider.js";
import { Buffer } from "buffer";
import { vellumIdl, VELLUM_PROGRAM_ID } from "./idl";
import { ENDPOINT } from "./connection";

type SignableTransaction = Transaction | VersionedTransaction;
const ACCOUNTING_AMOUNT_SCALE = 100;

interface WalletAdapterLike {
  publicKey: PublicKey | null;
  signTransaction?: <T extends SignableTransaction>(tx: T) => Promise<T>;
  signAllTransactions?: <T extends SignableTransaction>(txs: T[]) => Promise<T[]>;
}

interface InvoiceAccountRaw extends Record<string, unknown> {
  issuer: PublicKey;
  payer: PublicKey;
}

export interface ProgramAccount<TAccount> {
  publicKey: PublicKey;
  account: TAccount;
}

type VellumAccountNamespace = {
  invoice: {
    all: () => Promise<ProgramAccount<InvoiceAccountRaw>[]>;
  };
  company: {
    all: () => Promise<ProgramAccount<Record<string, unknown>>[]>;
  };
};

// Create a fresh connection for each operation to avoid stale blockhashes
function getConnection(): Connection {
  return new Connection(ENDPOINT, {
    commitment: "confirmed",
    confirmTransactionInitialTimeout: 60000,
  });
}

// Create program with wallet adapter - using proper Anchor wallet interface
export function getProgram(walletAdapter: WalletAdapterLike): Program | null {
  if (!walletAdapter.publicKey || !walletAdapter.signTransaction) return null;

  const connection = getConnection();
  const signTransaction = walletAdapter.signTransaction.bind(walletAdapter);

  const wallet: Wallet = {
    publicKey: walletAdapter.publicKey,
    signTransaction,
    signAllTransactions: walletAdapter.signAllTransactions
      ? walletAdapter.signAllTransactions.bind(walletAdapter)
      : async <T extends SignableTransaction>(txs: T[]): Promise<T[]> => {
          const signed: T[] = [];
          for (const tx of txs) {
            signed.push(await signTransaction(tx));
          }
          return signed;
        },
  };

  const provider = new AnchorProvider(connection, wallet, {
    commitment: "confirmed",
    preflightCommitment: "confirmed",
    skipPreflight: false,
  });

  return new Program(vellumIdl as Idl, provider);
}

async function signAndSendTransaction(
  program: Program,
  tx: Transaction,
  signTransaction: (tx: Transaction) => Promise<Transaction>
): Promise<TransactionSignature> {
  const { blockhash, lastValidBlockHeight } =
    await program.provider.connection.getLatestBlockhash("confirmed");

  tx.recentBlockhash = blockhash;
  tx.feePayer = program.provider.publicKey!;

  const signed = await signTransaction(tx);
  const signature = await program.provider.connection.sendRawTransaction(
    signed.serialize(),
    {
      skipPreflight: false,
      preflightCommitment: "confirmed",
    }
  );

  await program.provider.connection.confirmTransaction(
    { signature, blockhash, lastValidBlockHeight },
    "confirmed"
  );

  return signature;
}

// Derive PDA for Invoice account
export function getInvoicePda(invoiceId: string): [PublicKey, number] {
  const programId = new PublicKey(VELLUM_PROGRAM_ID);
  return PublicKey.findProgramAddressSync(
    [Buffer.from("invoice"), Buffer.from(invoiceId)],
    programId
  );
}

// Derive PDA for Company account
export function getCompanyPda(authority: PublicKey): [PublicKey, number] {
  const programId = new PublicKey(VELLUM_PROGRAM_ID);
  return PublicKey.findProgramAddressSync(
    [Buffer.from("company"), authority.toBuffer()],
    programId
  );
}

// Derive PDA for TaxPaymentRecord account
export function getTaxPaymentPda(invoiceKey: PublicKey): [PublicKey, number] {
  const programId = new PublicKey(VELLUM_PROGRAM_ID);
  return PublicKey.findProgramAddressSync(
    [Buffer.from("tax_payment"), invoiceKey.toBuffer()],
    programId
  );
}

// Create invoice on-chain
export async function createInvoiceOnChain(
  program: Program,
  payerAddress: string,
  amount: number,
  currency: string,
  taxAmount: number,
  taxRate: number,
  dueDate: number,
  ipfsHash: string,
  vatIdIssuer: string,
  vatIdPayer: string,
  signTransaction: (tx: Transaction) => Promise<Transaction>
): Promise<string> {
  const invoiceId = `inv_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
  const [invoicePda] = getInvoicePda(invoiceId);
  const payerPubkey = new PublicKey(payerAddress);
  const amountUnits = Math.round(amount * ACCOUNTING_AMOUNT_SCALE);
  const taxAmountUnits = Math.round(taxAmount * ACCOUNTING_AMOUNT_SCALE);

  // Build the transaction instruction
  const methodBuilder = program.methods
    .createInvoice(
      invoiceId,
      payerPubkey,
      new BN(amountUnits),
      currency,
      new BN(taxAmountUnits),
      taxRate,
      new BN(dueDate),
      ipfsHash || "QmMockHash",
      vatIdIssuer,
      vatIdPayer
    )
    .accounts({
      invoice: invoicePda,
      payerAccount: payerPubkey,
      issuer: program.provider.publicKey!,
      systemProgram: SystemProgram.programId,
    });

  const tx = await methodBuilder.transaction();
  return signAndSendTransaction(program, tx, signTransaction);
}

// Pay invoice on-chain (USDC transfer via SPL token)
export async function payInvoiceOnChain(
  program: Program,
  invoicePda: PublicKey,
  payerTokenAccount: PublicKey,
  issuerTokenAccount: PublicKey,
  signTransaction: (tx: Transaction) => Promise<Transaction>
): Promise<string> {
  const tx = await program.methods
    .payInvoice()
    .accounts({
      invoice: invoicePda,
      payer: program.provider.publicKey!,
      payerTokenAccount,
      issuerTokenAccount,
      tokenProgram: new PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"),
      systemProgram: SystemProgram.programId,
    })
    .transaction();

  return signAndSendTransaction(program, tx, signTransaction);
}

// Dispute invoice on-chain
export async function disputeInvoiceOnChain(
  program: Program,
  invoicePda: PublicKey,
  reason: string,
  signTransaction: (tx: Transaction) => Promise<Transaction>
): Promise<string> {
  const tx = await program.methods
    .disputeInvoice(reason)
    .accounts({
      invoice: invoicePda,
      disputer: program.provider.publicKey!,
    })
    .transaction();

  return signAndSendTransaction(program, tx, signTransaction);
}

// Mark invoice as overdue
export async function markOverdueOnChain(
  program: Program,
  invoicePda: PublicKey,
  signTransaction: (tx: Transaction) => Promise<Transaction>
): Promise<string> {
  const tx = await program.methods
    .markOverdue()
    .accounts({
      invoice: invoicePda,
    })
    .transaction();

  return signAndSendTransaction(program, tx, signTransaction);
}

// Register company on-chain
export async function registerCompanyOnChain(
  program: Program,
  name: string,
  vatId: string,
  country: string,
  walletAddress: PublicKey,
  signTransaction: (tx: Transaction) => Promise<Transaction>
): Promise<string> {
  const [companyPda] = getCompanyPda(program.provider.publicKey!);

  const tx = await program.methods
    .registerCompany(name, vatId, country, walletAddress)
    .accounts({
      company: companyPda,
      authority: program.provider.publicKey!,
      systemProgram: SystemProgram.programId,
    })
    .transaction();

  return signAndSendTransaction(program, tx, signTransaction);
}

// Record tax payment on-chain
export async function recordTaxPaymentOnChain(
  program: Program,
  invoicePda: PublicKey,
  currency: string,
  reference: string,
  signTransaction: (tx: Transaction) => Promise<Transaction>
): Promise<string> {
  const [taxPaymentPda] = getTaxPaymentPda(invoicePda);

  const tx = await program.methods
    .recordTaxPayment(currency, reference)
    .accounts({
      invoice: invoicePda,
      taxPaymentRecord: taxPaymentPda,
      recorder: program.provider.publicKey!,
      systemProgram: SystemProgram.programId,
    })
    .transaction();

  return signAndSendTransaction(program, tx, signTransaction);
}

// Fetch all invoices for a wallet
export async function fetchInvoices(
  program: Program,
  wallet: PublicKey
): Promise<ProgramAccount<InvoiceAccountRaw>[]> {
  try {
    const invoices = await (program.account as unknown as VellumAccountNamespace).invoice.all();
    return invoices.filter(
      (inv) =>
        inv.account.issuer.toBase58() === wallet.toBase58() ||
        inv.account.payer.toBase58() === wallet.toBase58()
    );
  } catch (error) {
    console.error("Failed to fetch invoices", error);
    throw error;
  }
}

// Fetch all companies
export async function fetchCompanies(
  program: Program
): Promise<ProgramAccount<Record<string, unknown>>[]> {
  try {
    return await (program.account as unknown as VellumAccountNamespace).company.all();
  } catch (error) {
    console.error("Failed to fetch companies", error);
    throw error;
  }
}
