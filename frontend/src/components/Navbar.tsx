"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useI18n } from "@/lib/i18n";

export default function Navbar() {
  const pathname = usePathname();
  const { locale, t, setLocale } = useI18n();

  const NAV_ITEMS = [
    { href: "/dashboard", label: t("nav.dashboard") },
    { href: "/create-invoice", label: t("nav.create") },
    { href: "/invoices", label: t("nav.invoices") },
    { href: "/companies", label: t("nav.companies") },
  ];

  return (
    <nav className="sticky top-0 z-50 border-b border-white/10 bg-slate-900/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-purple-500 to-blue-500">
            <span className="text-sm font-bold text-white">V</span>
          </div>
          <span className="text-lg font-bold text-white">
            Vellum
          </span>
          <span className="hidden rounded bg-purple-500/20 px-2 py-0.5 text-xs text-purple-300 sm:inline">
            ViDA
          </span>
        </Link>

        {/* Nav links */}
        <div className="hidden items-center gap-1 md:flex">
          {NAV_ITEMS.map((item) => {
            const isActive =
              item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-purple-500/20 text-purple-300"
                    : "text-slate-400 hover:bg-white/5 hover:text-white"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </div>

        {/* Right side: language + wallet */}
        <div className="flex items-center gap-3">
          {/* Language switcher */}
          <button
            onClick={() => setLocale(locale === "en" ? "de" : "en")}
            className="flex items-center gap-1 rounded-lg border border-white/10 bg-slate-800/50 px-2.5 py-1.5 text-xs font-medium text-slate-300 transition-colors hover:bg-slate-700/50 hover:text-white"
            title={locale === "en" ? "Auf Deutsch umschalten" : "Switch to English"}
          >
            <span>{locale === "en" ? "🇬🇧" : "🇩🇪"}</span>
            <span>{locale === "en" ? "EN" : "DE"}</span>
          </button>

          {/* Mobile nav toggle */}
          <div className="flex items-center gap-1 md:hidden">
            {NAV_ITEMS.filter((i) => i.href !== "/").map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`rounded-lg p-2 text-xs font-medium transition-colors ${
                  pathname.startsWith(item.href)
                    ? "bg-purple-500/20 text-purple-300"
                    : "text-slate-400"
                }`}
              >
                {item.label.split(" ")[0]}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
}
