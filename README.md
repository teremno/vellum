# Vellum

Vellum is a hackathon MVP for B2B invoicing and VAT automation on Solana.

The product lets a business create an on-chain invoice, attach payer and issuer VAT IDs, track invoice status, register company profiles, and record tax-payment metadata. The frontend is built for a Visa Frontier Hackathon demo around stablecoin settlement, transparent audit trails, and EU VAT-in-the-Digital-Age style reporting.

## Why it exists

Cross-border B2B invoicing is slow, fragmented, and hard to audit. Vellum explores a Solana-based workflow where invoice state, payer/issuer identity, tax metadata, and payment events can be verified from a shared ledger.

This is not a certified tax product. It is a working technical prototype that demonstrates the payment and compliance flow.

## Architecture

- `frontend/` - Next.js 16 app with Solana wallet connection, invoice creation, live invoice/company reads, dashboard, and VAT calculator.
- `contract/` - Anchor smart contract for invoices, company registration, invoice payment/dispute/overdue state, and tax payment records.

## Smart contract

Program ID:

```text
GtaC3d2ehX8jayPiTzJwP1vbs5PFbCQ4dkS7GoBw7FDN
```

Configured cluster:

```text
devnet
```

Core instructions:

- `register_company`
- `create_invoice`
- `pay_invoice`
- `dispute_invoice`
- `mark_overdue`
- `record_tax_payment`

## Frontend features

- Phantom wallet connection on Solana devnet.
- On-chain invoice creation.
- Live invoice list for the connected wallet.
- Live dashboard stats from invoice accounts.
- Live company profile loading and company registration.
- EU VAT calculator with standard VAT rates.
- Solana Explorer links for submitted transactions.

## Run locally

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:3000`.

If port `3000` is already in use:

```bash
node node_modules/next/dist/bin/next dev --turbo -p 3001
```

### Contract

The contract workflow is easiest from WSL/Linux with Solana and Anchor installed.

```bash
cd contract
npm install
anchor build
anchor test --provider.cluster localnet
```

## Verification

These checks were run successfully:

```bash
cd frontend
npm run lint
node node_modules/typescript/bin/tsc --noEmit
node node_modules/next/dist/bin/next build
```

```bash
cd contract
cargo check
anchor build
anchor test --provider.cluster localnet
```

Current local contract test result: `16 passing`.

## Known limitations

- Payment UX still needs frontend token-account selection before it is demo-friendly for non-technical users.
- Devnet faucet limits can block devnet test runs; localnet tests are more reliable.
- VAT/ViDA logic is a prototype and not legal advice.
- The frontend stores invoice values in accounting minor units for on-chain integer compatibility.

## Hackathon demo flow

1. Connect Phantom on devnet.
2. Register a company profile.
3. Create an invoice with payer wallet, VAT IDs, due date, and IPFS CID.
4. Open the live invoice list and dashboard.
5. Show the transaction in Solana Explorer.
6. Explain how the same invoice state can support settlement, dispute handling, and tax-payment records.
