
"use client";

import { useState } from "react";
import Link from "next/link";


const navigationLinks = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  { label: "Academics", href: "/academics" },
  { label: "Admissions", href: "/admissions" },
  { label: "Notices", href: "/notices" },
  { label: "Contact", href: "/contact" },
];


export default function PublicHeader() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-[#244B38]/10 bg-[#F7F5EE]/95 text-[#20382C] backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-4 lg:px-8">
        <Link
          href="/"
          className="flex min-w-0 items-center gap-3"
          onClick={() => setMenuOpen(false)}
        >
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#214D38] text-xl text-[#F7F5EE]">
            C
          </span>

          <span className="min-w-0">
            <span className="block text-sm font-bold tracking-wide sm:text-base">
              COLLEGE PORTAL
            </span>
            <span className="block text-[9px] uppercase tracking-[0.15em] text-[#68776B] sm:text-[10px] sm:tracking-[0.2em]">
              Learning · Growth · Excellence
            </span>
          </span>
        </Link>

        <nav
          aria-label="Main navigation"
          className="hidden items-center gap-7 text-sm font-medium text-[#526458] lg:flex"
        >
          {navigationLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="transition hover:text-[#214D38]"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex shrink-0 items-center gap-2">
          <Link
            href="/login"
            className="rounded-full bg-[#214D38] px-3 py-2.5 text-xs font-semibold text-white transition hover:bg-[#173A29] sm:px-5 sm:py-3 sm:text-sm"
          >
            Portal Login <span aria-hidden="true">↗</span>
          </Link>

          <button
            type="button"
            aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"}
            aria-expanded={menuOpen}
            aria-controls="mobile-navigation"
            onClick={() => setMenuOpen((open) => !open)}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-[#214D38]/15 text-[#214D38] transition hover:bg-[#E5E6DA] lg:hidden"
          >
            {menuOpen ? (
              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                className="h-5 w-5"
              >
                <path
                  d="M6 6l12 12M18 6L6 18"
                  strokeLinecap="round"
                />
              </svg>
            ) : (
              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                className="h-5 w-5"
              >
                <path
                  d="M4 7h16M4 12h16M4 17h16"
                  strokeLinecap="round"
                />
              </svg>
            )}
          </button>
        </div>
      </div>

      <div
        id="mobile-navigation"
        className={`${menuOpen ? "block" : "hidden"} border-t border-[#214D38]/10 bg-[#F7F5EE] lg:hidden`}
      >
        <nav
          aria-label="Mobile navigation"
          className="mx-auto flex max-w-7xl flex-col px-5 py-3"
        >
          {navigationLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              onClick={() => setMenuOpen(false)}
              className="border-b border-[#214D38]/10 py-3.5 text-sm font-medium text-[#526458] transition last:border-b-0 hover:text-[#214D38]"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
