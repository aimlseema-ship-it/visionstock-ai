import { Link, useLocation } from "@tanstack/react-router";
import { useState, type ReactNode } from "react";
import { BarChart3, Bell, Boxes, Camera, LayoutDashboard, Menu, Workflow, X, Eye } from "lucide-react";
import { useStore } from "@/lib/store";

const NAV = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/scan", label: "Scan Items", icon: Camera },
  { to: "/inventory", label: "Inventory", icon: Boxes },
  { to: "/analytics", label: "Analytics", icon: BarChart3 },
  { to: "/alerts", label: "Alerts", icon: Bell },
  { to: "/workflow", label: "How It Works", icon: Workflow },
] as const;

export function AppShell({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const { alerts } = useStore();
  const unread = alerts.filter((a) => !a.read).length;
  const path = useLocation({ select: (l) => l.pathname });

  const nav = (
    <nav className="flex flex-col gap-1">
      {NAV.map(({ to, label, icon: Icon }) => {
        const active = path === to;
        return (
          <Link key={to} to={to} onClick={() => setOpen(false)}
            className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${active ? "bg-navy-foreground/10 text-navy-foreground" : "text-navy-foreground/65 hover:bg-navy-foreground/5 hover:text-navy-foreground"}`}>
            <Icon className="h-4 w-4" />
            <span className="flex-1">{label}</span>
            {to === "/alerts" && unread > 0 && (
              <span className="rounded-full bg-destructive px-2 text-xs text-destructive-foreground">{unread}</span>
            )}
          </Link>
        );
      })}
    </nav>
  );

  const brand = (
    <Link to="/" className="flex items-center gap-2 text-navy-foreground">
      <span className="grid h-9 w-9 place-items-center rounded-lg bg-accent text-accent-foreground"><Eye className="h-5 w-5" /></span>
      <span className="text-lg font-bold">VisionStock <span className="text-accent">AI</span></span>
    </Link>
  );

  return (
    <div className="min-h-screen lg:flex">
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col gap-8 bg-navy p-5 lg:flex">
        {brand}
        {nav}
        <div className="mt-auto rounded-lg border border-navy-foreground/15 p-3 text-xs text-navy-foreground/70">
          <p className="font-semibold text-navy-foreground">Demo mode</p>
          OpenCV & AWS (S3, DynamoDB, SNS) are simulated until connected.
        </div>
      </aside>

      <header className="sticky top-0 z-30 flex items-center justify-between bg-navy px-4 py-3 lg:hidden">
        {brand}
        <button aria-label="Menu" onClick={() => setOpen(!open)} className="text-navy-foreground">
          {open ? <X /> : <Menu />}
        </button>
      </header>
      {open && <div className="sticky top-14 z-20 bg-navy p-4 lg:hidden">{nav}</div>}

      <div className="flex-1 min-w-0">
        <div className="border-b border-warning/40 bg-warning/15 px-4 py-2 text-center text-xs font-medium text-foreground">
          DEMO DATA — Detection and cloud services are simulated. Connect OpenCV + AWS to go live.
        </div>
        <main className="mx-auto max-w-7xl p-4 md:p-8">{children}</main>
      </div>
    </div>
  );
}

export function PageHeader({ title, sub, action }: { title: string; sub?: string; action?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="text-2xl font-bold md:text-3xl">{title}</h1>
        {sub && <p className="mt-1 text-sm text-muted-foreground">{sub}</p>}
      </div>
      {action}
    </div>
  );
}

export function Panel({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`rounded-xl border border-border bg-card p-5 shadow-card ${className}`}>{children}</div>;
}
