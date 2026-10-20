import { createFileRoute, Link } from "@tanstack/react-router";
import { AlertTriangle, Boxes, Camera, Package, ScanLine } from "lucide-react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { useStore } from "@/lib/store";
import { PageHeader, Panel } from "@/components/AppShell";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "VisionStock AI — Inventory Dashboard" },
      { name: "description", content: "AI-powered inventory management with OpenCV object detection and AWS cloud alerts." },
      { property: "og:title", content: "VisionStock AI — See It. Track It. Never Run Out." },
      { property: "og:description", content: "Snap a photo, detect and count items, and get automatic low-stock alerts." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const { products, alerts, scans } = useStore();
  const low = products.filter((p) => p.qty <= p.threshold);
  const units = products.reduce((a, b) => a + b.qty, 0);
  const chart = products.slice(0, 8).map((p) => ({ name: p.name.split(" ")[0], qty: p.qty, threshold: p.threshold }));

  return (
    <>
      <section className="mb-8 overflow-hidden rounded-2xl bg-hero p-6 text-navy-foreground md:p-10">
        <p className="font-mono-x text-xs uppercase tracking-widest text-navy-foreground/70">OpenCV + AWS Hackathon</p>
        <h1 className="mt-3 text-3xl font-bold md:text-5xl">See It. Track It. Never Run Out.</h1>
        <p className="mt-3 max-w-xl text-navy-foreground/80">Upload a photo of your shelf — VisionStock AI detects and counts items, updates your inventory and alerts you before stock runs low.</p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link to="/scan" className="inline-flex items-center gap-2 rounded-lg bg-accent px-5 py-2.5 font-medium text-accent-foreground hover:opacity-90"><Camera className="h-4 w-4" />Scan items</Link>
          <Link to="/inventory" className="inline-flex items-center gap-2 rounded-lg border border-navy-foreground/30 px-5 py-2.5 font-medium hover:bg-navy-foreground/10">View inventory</Link>
        </div>
      </section>

      <PageHeader title="Overview" sub="Live summary of your stock (demo data)" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat icon={Package} label="Products" value={products.length} />
        <Stat icon={Boxes} label="Total units" value={units} />
        <Stat icon={AlertTriangle} label="Low stock" value={low.length} tone="danger" />
        <Stat icon={ScanLine} label="Scans" value={scans.length} />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <Panel className="lg:col-span-2">
          <h3 className="mb-4 font-semibold">Stock vs threshold</h3>
          <div className="h-72">
            <ResponsiveContainer>
              <BarChart data={chart}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="name" fontSize={12} stroke="var(--muted-foreground)" />
                <YAxis fontSize={12} stroke="var(--muted-foreground)" />
                <Tooltip />
                <Bar dataKey="qty" name="In stock" fill="var(--primary)" radius={[6, 6, 0, 0]} />
                <Bar dataKey="threshold" name="Threshold" fill="var(--accent)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Panel>
        <Panel>
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-semibold">Low-stock items</h3>
            <Link to="/alerts" className="text-xs font-medium text-accent">All alerts ({alerts.length})</Link>
          </div>
          {low.length === 0 ? <p className="text-sm text-muted-foreground">All items are well stocked.</p> : (
            <ul className="space-y-3">
              {low.map((p) => (
                <li key={p.id} className="flex items-center justify-between rounded-lg bg-destructive/10 px-3 py-2 text-sm">
                  <span className="font-medium">{p.name}</span>
                  <span className="font-mono-x text-destructive">{p.qty}/{p.threshold}</span>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>
    </>
  );
}

function Stat({ icon: Icon, label, value, tone }: { icon: typeof Package; label: string; value: number; tone?: "danger" }) {
  return (
    <Panel>
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{label}</p>
        <span className={`grid h-9 w-9 place-items-center rounded-lg ${tone ? "bg-destructive/10 text-destructive" : "bg-secondary text-primary"}`}><Icon className="h-4 w-4" /></span>
      </div>
      <p className={`mt-2 text-3xl font-bold ${tone && value > 0 ? "text-destructive" : ""}`}>{value}</p>
    </Panel>
  );
}
