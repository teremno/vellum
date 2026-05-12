import { Cluster, clusterApiUrl, Commitment } from "@solana/web3.js";

export const CLUSTER: Cluster = "devnet";
export const ENDPOINT = clusterApiUrl(CLUSTER);
export const COMMITMENT: Commitment = "confirmed";

// Program ID for the Vellum invoicing program (deployed on Solana Devnet)
export const VELLUM_PROGRAM_ID = "GtaC3d2ehX8jayPiTzJwP1vbs5PFbCQ4dkS7GoBw7FDN";

// USDC Mint on devnet
export const USDC_MINT_DEVNET = "4zMMC9srt5Ri5X14GAgXVhP8RkNQ8Q8bKX4Zz3m1e5v2";