"use client";

import { createContext, useContext, useState, useCallback, ReactNode } from "react";

type Locale = "en" | "de";

const translations: Record<Locale, Record<string, string>> = {
  en: {
    "nav.dashboard": "Dashboard",
    "nav.invoices": "Invoices",
    "nav.create": "Create Invoice",
    "nav.companies": "Companies",
    "hero.title": "Vellum — B2B Invoicing on Solana",
    "hero.subtitle": "Automated EU VAT compliance with ViDA-ready tax calculation. Create, pay, and track invoices on-chain.",
    "hero.feature1": "Create Invoices",
    "hero.feature2": "Pay with USDC",
    "hero.feature3": "Auto EU VAT",
    "hero.feature4": "ViDA Compliant",
    "hero.cta": "Get Started",
    "hero.connected": "View Dashboard",
    "create.title": "Create Invoice",
    "create.subtitle": "Generate a new B2B invoice on Solana with automated EU VAT calculation",
    "create.payer": "Payer Wallet Address",
    "create.payer.placeholder": "Enter payer's Solana wallet address",
    "create.amount": "Amount (excl. VAT)",
    "create.currency": "Currency",
    "create.dueDate": "Due Date",
    "create.vatIssuer": "Issuer VAT ID",
    "create.vatPayer": "Payer VAT ID",
    "create.description": "Description",
    "create.ipfs": "Invoice PDF (IPFS Hash)",
    "create.ipfs.hint": "Upload your invoice PDF to IPFS and paste the CID here",
    "create.issuer": "Issuer",
    "create.summary": "Invoice Summary",
    "create.netAmount": "Net Amount",
    "create.vatRate": "VAT Rate",
    "create.vatAmount": "VAT Amount",
    "create.total": "Total Due",
    "create.submit": "Create Invoice on Solana",
    "create.signing": "Signing Transaction...",
    "create.success": "Invoice Created Successfully!",
    "create.error": "Error",
    "create.connect": "Connect your wallet to create an invoice",
    "tax.title": "EU VAT Calculator",
    "tax.vida": "ViDA Ready",
    "tax.country": "EU Member State",
    "tax.custom": "Custom Rate",
    "tax.net": "Net Amount",
    "tax.total": "Total (incl. VAT)",
    "tax.note": "Under the EU ViDA (VAT in the Digital Age) directive, real-time digital invoicing with automated VAT calculation ensures compliance with the 2028 e-invoicing mandate.",
    "invoices.title": "Invoices",
    "invoices.subtitle": "Manage and track all your B2B invoices",
    "invoices.new": "New Invoice",
    "invoices.search": "Search by ID, address, currency...",
    "invoices.noInvoices": "No invoices found",
    "invoices.showing": "Showing",
    "invoices.of": "of",
    "status.Draft": "Draft",
    "status.Pending": "Pending Payment",
    "status.Paid": "Paid",
    "status.Overdue": "Overdue",
    "status.Disputed": "Disputed",
    "filter.all": "All",
    "dashboard.title": "Dashboard",
    "dashboard.subtitle": "Overview of your invoicing activity",
    "dashboard.totalInvoices": "Total Invoices",
    "dashboard.totalPaid": "Total Paid",
    "dashboard.totalPending": "Total Pending",
    "dashboard.totalOverdue": "Total Overdue",
    "dashboard.vatCollected": "VAT Collected",
    "companies.title": "Companies",
    "companies.subtitle": "Register and manage companies on-chain",
    "companies.register": "Register Company",
    "companies.name": "Company Name",
    "companies.vatId": "VAT ID",
    "companies.country": "Country",
    "companies.wallet": "Wallet Address",
  },
  de: {
    "nav.dashboard": "Dashboard",
    "nav.invoices": "Rechnungen",
    "nav.create": "Rechnung erstellen",
    "nav.companies": "Unternehmen",
    "hero.title": "Vellum — B2B-Rechnungen auf Solana",
    "hero.subtitle": "Automatisierte EU-MwSt.-Compliance mit ViDA-ready Steuerberechnung. Rechnungen on-chain erstellen, bezahlen und verfolgen.",
    "hero.feature1": "Rechnungen erstellen",
    "hero.feature2": "Mit USDC bezahlen",
    "hero.feature3": "Automatische EU-MwSt.",
    "hero.feature4": "ViDA-konform",
    "hero.cta": "Loslegen",
    "hero.connected": "Dashboard anzeigen",
    "create.title": "Rechnung erstellen",
    "create.subtitle": "Neue B2B-Rechnung auf Solana mit automatisierter EU-MwSt.-Berechnung erstellen",
    "create.payer": "Zahlungspflichtige Wallet-Adresse",
    "create.payer.placeholder": "Solana-Wallet-Adresse des Zahlungspflichtigen eingeben",
    "create.amount": "Betrag (ohne MwSt.)",
    "create.currency": "Währung",
    "create.dueDate": "Fälligkeitsdatum",
    "create.vatIssuer": "USt-IdNr. des Ausstellers",
    "create.vatPayer": "USt-IdNr. des Empfängers",
    "create.description": "Beschreibung",
    "create.ipfs": "Rechnungs-PDF (IPFS-Hash)",
    "create.ipfs.hint": "Laden Sie Ihre Rechnungs-PDF auf IPFS hoch und fügen Sie die CID ein",
    "create.issuer": "Aussteller",
    "create.summary": "Rechnungsübersicht",
    "create.netAmount": "Nettobetrag",
    "create.vatRate": "MwSt.-Satz",
    "create.vatAmount": "MwSt.-Betrag",
    "create.total": "Gesamtbetrag",
    "create.submit": "Rechnung auf Solana erstellen",
    "create.signing": "Transaktion wird signiert...",
    "create.success": "Rechnung erfolgreich erstellt!",
    "create.error": "Fehler",
    "create.connect": "Verbinden Sie Ihr Wallet, um eine Rechnung zu erstellen",
    "tax.title": "EU-MwSt.-Rechner",
    "tax.vida": "ViDA-ready",
    "tax.country": "EU-Mitgliedsstaat",
    "tax.custom": "Benutzerdefinierter Satz",
    "tax.net": "Nettobetrag",
    "tax.total": "Gesamt (inkl. MwSt.)",
    "tax.note": "Gemäß der EU-ViDA-Richtlinie (MwSt. im digitalen Zeitalter) stellt die Echtzeit-Digitalrechnung mit automatisierter MwSt.-Berechnung die Konformität mit der e-Rechnungspflicht 2028 sicher.",
    "invoices.title": "Rechnungen",
    "invoices.subtitle": "Alle B2B-Rechnungen verwalten und verfolgen",
    "invoices.new": "Neue Rechnung",
    "invoices.search": "Suche nach ID, Adresse, Währung...",
    "invoices.noInvoices": "Keine Rechnungen gefunden",
    "invoices.showing": "Anzeige",
    "invoices.of": "von",
    "status.Draft": "Entwurf",
    "status.Pending": "Zahlung ausstehend",
    "status.Paid": "Bezahlt",
    "status.Overdue": "Überfällig",
    "status.Disputed": "Strittig",
    "filter.all": "Alle",
    "dashboard.title": "Dashboard",
    "dashboard.subtitle": "Überblick über Ihre Rechnungsaktivität",
    "dashboard.totalInvoices": "Rechnungen gesamt",
    "dashboard.totalPaid": "Gesamt bezahlt",
    "dashboard.totalPending": "Ausstehend",
    "dashboard.totalOverdue": "Überfällig",
    "dashboard.vatCollected": "MwSt. erfasst",
    "companies.title": "Unternehmen",
    "companies.subtitle": "Unternehmen on-chain registrieren und verwalten",
    "companies.register": "Unternehmen registrieren",
    "companies.name": "Unternehmensname",
    "companies.vatId": "USt-IdNr.",
    "companies.country": "Land",
    "companies.wallet": "Wallet-Adresse",
  },
};

interface I18nContextType {
  locale: Locale;
  t: (key: string) => string;
  setLocale: (locale: Locale) => void;
}

const I18nContext = createContext<I18nContextType>({
  locale: "en",
  t: (key: string) => key,
  setLocale: () => {},
});

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocale] = useState<Locale>("en");

  const t = useCallback(
    (key: string) => translations[locale][key] || translations.en[key] || key,
    [locale]
  );

  return (
    <I18nContext.Provider value={{ locale, t, setLocale }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  return useContext(I18nContext);
}

export type { Locale };