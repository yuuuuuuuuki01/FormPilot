import Link from "next/link";
import type { Route } from "next";
import type { ReactNode } from "react";
import { BarChart3, Building2, Mail, Search, Settings, ShieldAlert } from "lucide-react";

const navItems = [
  { href: "/" as Route, label: "収集ビュー", icon: Search },
  { href: "/collection-rules" as Route, label: "収集ルール", icon: Building2 },
  { href: "/replies" as Route, label: "返信一覧", icon: Mail },
  { href: "/reviews" as Route, label: "レビュー", icon: ShieldAlert },
  { href: "/settings" as Route, label: "設定", icon: Settings }
];

export function AppShell({
  title,
  description,
  children
}: {
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <div className="shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-badge">
            <BarChart3 size={18} />
          </div>
          <div>
            <p className="eyebrow">Outbound Autopilot</p>
            <h1>FormPilot</h1>
          </div>
        </div>
        <nav className="nav">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link key={item.href} href={item.href} className="nav-link">
                <Icon size={18} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </aside>
      <main className="main">
        <header className="page-header">
          <div>
            <p className="eyebrow">MVP Workspace</p>
            <h2>{title}</h2>
            <p className="page-description">{description}</p>
          </div>
        </header>
        {children}
      </main>
    </div>
  );
}
