"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { label: "Dashboard", href: "/" },
  { label: "Sets", href: "/sets" },
  { label: "Cards", href: "/cards" },
  { label: "Lists", href: "/lists" },
];

export function TopNav() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 border-b border-slate-800/80 bg-slate-950/90 backdrop-blur">
      <nav className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-3 md:px-6">
        <p className="text-sm font-semibold tracking-[0.2em] text-emerald-300">TCG MANAGER</p>
        <ul className="flex items-center gap-2 sm:gap-3">
          {navItems.map((item) => {
            const isActive = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`rounded-lg px-3 py-1.5 text-xs font-medium tracking-wide transition md:text-sm ${
                    isActive
                      ? "bg-emerald-400/20 text-emerald-300"
                      : "text-slate-300 hover:bg-slate-800 hover:text-white"
                  }`}
                >
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </header>
  );
}
