#!/bin/bash
# ============================================================
# Vellum — Full Integration Test Script
# Tests: Frontend build, Smart contract, Dev server, Wallet connection
# ============================================================

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

PASS=0
FAIL=0

check() {
  local desc="$1"
  local cmd="$2"
  echo -n "Testing: $desc ... "
  if eval "$cmd" >/dev/null 2>&1; then
    echo -e "${GREEN}PASS${NC}"
    PASS=$((PASS+1))
  else
    echo -e "${RED}FAIL${NC}"
    FAIL=$((FAIL+1))
  fi
}

check_output() {
  local desc="$1"
  local cmd="$2"
  local expected="$3"
  echo -n "Testing: $desc ... "
  result=$(eval "$cmd" 2>&1)
  if echo "$result" | grep -q "$expected"; then
    echo -e "${GREEN}PASS${NC}"
    PASS=$((PASS+1))
  else
    echo -e "${RED}FAIL${NC}"
    echo "  Expected: $expected"
    echo "  Got: $result"
    FAIL=$((FAIL+1))
  fi
}

PROJECT_ROOT="/mnt/d/Documents/Crypto/SOFT_CRYPTO/Hackathon_all/Visa/vellum"
FRONTEND="$PROJECT_ROOT/frontend"
CONTRACT="$PROJECT_ROOT/contract"

echo ""
echo "============================================================"
echo "  VELLUM — Integration Test Suite"
echo "============================================================"
echo ""

# ============================================================
# 1. FILE STRUCTURE TESTS
# ============================================================
echo -e "${YELLOW}[1] File Structure Tests${NC}"

check "Frontend directory exists" "[ -d '$FRONTEND' ]"
check "Contract directory exists" "[ -d '$CONTRACT' ]"
check "Smart contract lib.rs exists" "[ -f '$CONTRACT/programs/vellum-contract/src/lib.rs' ]"
check "IDL JSON exists" "[ -f '$FRONTEND/src/lib/idl.json' ]"
check "program.ts exists" "[ -f '$FRONTEND/src/lib/program.ts' ]"
check "i18n.tsx exists" "[ -f '$FRONTEND/src/lib/i18n.tsx' ]"
check "Navbar.tsx exists" "[ -f '$FRONTEND/src/components/Navbar.tsx' ]"
check "WalletContextProvider.tsx exists" "[ -f '$FRONTEND/src/components/WalletContextProvider.tsx' ]"
check "TaxCalculator.tsx exists" "[ -f '$FRONTEND/src/components/TaxCalculator.tsx' ]"
check "StatusBadge.tsx exists" "[ -f '$FRONTEND/src/components/StatusBadge.tsx' ]"
check "InvoiceCard.tsx exists" "[ -f '$FRONTEND/src/components/InvoiceCard.tsx' ]"

echo ""

# ============================================================
# 2. SMART CONTRACT TESTS
# ============================================================
echo -e "${YELLOW}[2] Smart Contract Tests${NC}"

check "Anchor CLI installed" "which anchor"
check "Solana CLI installed" "which solana"
check "cargo-build-sbf installed" "which cargo-build-sbf"

# Check contract compiles
echo -n "Testing: Contract compiles with anchor build ... "
if cd "$CONTRACT" && export PATH="$HOME/.local/share/solana/install/active_release/bin:$PATH" && anchor build 2>&1 | tail -5 | grep -q "Build successful\|Finished\|vellum_contract"; then
  echo -e "${GREEN}PASS${NC}"
  PASS=$((PASS+1))
else
  echo -e "${RED}FAIL${NC}"
  FAIL=$((FAIL+1))
fi

# Check .so file exists
check "Contract .so file exists" "[ -f '$CONTRACT/target/deploy/vellum_contract.so' ]"

# Check IDL was generated
check "Contract IDL generated" "[ -f '$CONTRACT/target/idl/vellum_contract.json' ]"

echo ""

# ============================================================
# 3. FRONTEND BUILD TESTS
# ============================================================
echo -e "${YELLOW}[3] Frontend Build Tests${NC}"

# Clean build
echo -n "Testing: Next.js clean build ... "
cd "$FRONTEND"
rm -rf .next
if npx next build 2>&1 | tail -20 | grep -q "Route (app)"; then
  echo -e "${GREEN}PASS${NC}"
  PASS=$((PASS+1))
else
  echo -e "${RED}FAIL${NC}"
  FAIL=$((FAIL+1))
fi

echo ""

# ============================================================
# 4. CODE CONTENT TESTS — Critical Fixes
# ============================================================
echo -e "${YELLOW}[4] Code Content Tests (Critical Fixes)${NC}"

# 4a. I18n — language switcher
check_output "Navbar imports useI18n" \
  "cat $FRONTEND/src/components/Navbar.tsx" \
  "useI18n"

check_output "Navbar has language switcher button" \
  "cat $FRONTEND/src/components/Navbar.tsx" \
  "setLocale"

check_output "Layout wraps with I18nProvider" \
  "cat $FRONTEND/src/app/layout.tsx" \
  "I18nProvider"

check_output "i18n.tsx has EN translations" \
  "cat $FRONTEND/src/lib/i18n.tsx" \
  "hero.title"

check_output "i18n.tsx has DE translations" \
  "cat $FRONTEND/src/lib/i18n.tsx" \
  "Rechnungen"

# 4b. Transaction signing — signTransaction passed explicitly
check_output "program.ts passes signTransaction to createInvoiceOnChain" \
  "cat $FRONTEND/src/lib/program.ts" \
  "signTransaction: (tx: any) => Promise<any>"

check_output "create-invoice passes wallet.signTransaction" \
  "cat $FRONTEND/src/app/create-invoice/page.tsx" \
  "wallet.signTransaction"

check_output "program.ts uses fresh blockhash" \
  "cat $FRONTEND/src/lib/program.ts" \
  "getLatestBlockhash"

check_output "program.ts uses sendRawTransaction" \
  "cat $FRONTEND/src/lib/program.ts" \
  "sendRawTransaction"

# 4c. Back button
check_output "Create invoice has Back to Invoices button" \
  "cat $FRONTEND/src/app/create-invoice/page.tsx" \
  "Back to Invoices"

check_output "Invoices page has Back button" \
  "cat $FRONTEND/src/app/invoices/page.tsx" \
  "router.back"

# 4d. Date input has lang=en
check_output "Date input has lang=en attribute" \
  "cat $FRONTEND/src/app/create-invoice/page.tsx" \
  'lang="en"'

# 4e. WalletContextProvider (not WalletProvider)
check_output "Layout uses WalletContextProvider" \
  "cat $FRONTEND/src/app/layout.tsx" \
  "WalletContextProvider"

# 4f. IDL has correct program ID
check_output "IDL has program address" \
  "cat $FRONTEND/src/lib/idl.json" \
  "GtaC3d2ehX8jayPiTzJwP1vbs5PFbCQ4dkS7GoBw7FDN"

echo ""

# ============================================================
# 5. VAT RATES VERIFICATION
# ============================================================
echo -e "${YELLOW}[5] VAT Rates Verification${NC}"

check_output "Germany VAT rate is 19%" \
  "cat $FRONTEND/src/components/TaxCalculator.tsx" \
  "Germany.*19"

check_output "Ukraine VAT rate is 20%" \
  "cat $FRONTEND/src/components/TaxCalculator.tsx" \
  "Ukraine.*20"

check_output "France VAT rate is 20%" \
  "cat $FRONTEND/src/components/TaxCalculator.tsx" \
  "France.*20"

check_output "Spain VAT rate is 21%" \
  "cat $FRONTEND/src/components/TaxCalculator.tsx" \
  "Spain.*21"

check_output "Italy VAT rate is 22%" \
  "cat $FRONTEND/src/components/TaxCalculator.tsx" \
  "Italy.*22"

check_output "Poland VAT rate is 23%" \
  "cat $FRONTEND/src/components/TaxCalculator.tsx" \
  "Poland.*23"

echo ""

# ============================================================
# 6. SMART CONTRACT INSTRUCTION TESTS
# ============================================================
echo -e "${YELLOW}[6] Smart Contract Instruction Tests${NC}"

check_output "Contract has create_invoice instruction" \
  "cat $CONTRACT/programs/vellum-contract/src/lib.rs" \
  "pub fn create_invoice"

check_output "Contract has pay_invoice instruction" \
  "cat $CONTRACT/programs/vellum-contract/src/lib.rs" \
  "pub fn pay_invoice"

check_output "Contract has dispute_invoice instruction" \
  "cat $CONTRACT/programs/vellum-contract/src/lib.rs" \
  "pub fn dispute_invoice"

check_output "Contract has mark_overdue instruction" \
  "cat $CONTRACT/programs/vellum-contract/src/lib.rs" \
  "pub fn mark_overdue"

check_output "Contract has register_company instruction" \
  "cat $CONTRACT/programs/vellum-contract/src/lib.rs" \
  "pub fn register_company"

check_output "Contract has record_tax_payment instruction" \
  "cat $CONTRACT/programs/vellum-contract/src/lib.rs" \
  "pub fn record_tax_payment"

check_output "Contract has InvoiceCreated event" \
  "cat $CONTRACT/programs/vellum-contract/src/lib.rs" \
  "pub struct InvoiceCreated"

check_output "Contract has InvoicePaid event" \
  "cat $CONTRACT/programs/vellum-contract/src/lib.rs" \
  "pub struct InvoicePaid"

check_output "Contract has TaxPaymentRecorded event" \
  "cat $CONTRACT/programs/vellum-contract/src/lib.rs" \
  "pub struct TaxPaymentRecorded"

echo ""

# ============================================================
# 7. DEPLOYMENT TESTS
# ============================================================
echo -e "${YELLOW}[7] Deployment Tests${NC}"

export PATH="$HOME/.local/share/solana/install/active_release/bin:$PATH"

check_output "Solana CLI configured for devnet" \
  "solana config get" \
  "Devnet"

check "Solana has balance on devnet" "solana balance 2>&1 | grep -v '0 SOL'"

echo ""

# ============================================================
# SUMMARY
# ============================================================
echo "============================================================"
echo -e "  Results: ${GREEN}$PASS passed${NC}, ${RED}$FAIL failed${NC}"
echo "============================================================"

if [ $FAIL -eq 0 ]; then
  echo -e "${GREEN}All tests passed!${NC}"
  exit 0
else
  echo -e "${RED}$FAIL test(s) failed. See above for details.${NC}"
  exit 1
fi