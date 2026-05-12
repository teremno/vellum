// Vellum Contract — Deployment Migration
// This script runs after `anchor deploy` to perform any on-chain setup

import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { VellumContract } from "../target/types/vellum_contract";

async function main() {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.VellumContract as Program<VellumContract>;

  console.log("========================================");
  console.log("Vellum Contract Deployment");
  console.log("========================================");
  console.log(`Program ID: ${program.programId.toBase58()}`);
  console.log(`Provider: ${provider.connection.rpcEndpoint}`);
  console.log(`Authority: ${provider.wallet.publicKey.toBase58()}`);
  console.log("========================================");

  // Post-deployment: You can register the deployer's company here
  // or perform any one-time setup. For now, we just log success.

  console.log("✅ Deployment complete. No post-deploy steps required.");
  console.log("Use the Vellum frontend to register companies and create invoices.");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });