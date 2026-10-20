import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Area, AreaChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis, Legend } from "recharts";
import { useStore } from "@/lib/store";
import { PageHeader, Panel } from "@/components/AppShell";

export const Route = createFileRoute("/analytics")({
  head: () => ({
    meta: [
      { title: "Analytics — VisionStock AI" },
      { name: "description", content: "Charts for stock levels, categories and usage trends." },
      { property: "og:title", content: "Analytics — VisionStock AI" },
      { property: "og:description", content: "Inventory analytics dashboard with charts." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Analytics,
});

const COLORS = ["var(--primary)", "var(--accent)", "var(--success)", "var(--warning)", "var(--destructive)", "var(--muted-foreground)"];
const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function Analytics() {
  const { products, scans } = useStore();
  const [trend] = useState(() => DAYS.map((d, i) => ({ day: d, stock: 70 + Math.round(Math.sin(i) * 15 + i * 3), used: 10 + Math.round(Math.random() * 12) })));
  const cats = Object.entries(products.reduce<Record<string, number>>((a, p) => ((a[p.category] = (a[p.category] ?? 0) + p.qty), a), {})).map(([name, value]) => ({ name, value }));
  const health = [
    { name: "In stock", value: products.filter((p) => p.qty > p.threshold).length },
    { name: "Low", value: products.filter((p) => p.qty <= p.threshold && p.qty > 0).length },
    { name: "Out", value: products.filter((p) => p.qty === 0).length },
  ];

  return (
    <>
      <PageHeader title="Analytics" sub="Weekly trend is sample demo data; category & health charts use your inventory." />
      <div className="grid gap-6 lg:grid-cols-2">
        <Panel className="lg:col-span-2">
          <h3 className="mb-4 font-semibold">Weekly stock trend <span className="ml-2 rounded bg-warning/20 px-2 text-xs">Demo</span></h3>
          <div className="h-72">
            <ResponsiveContainer>
              <AreaChart data={trend}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="day" fontSize={12} stroke="var(--muted-foreground)" />
                <YAxis fontSize={12} stroke="var(--muted-foreground)" />
                <Tooltip /><Legend />
                <Area dataKey="stock" name="Units in stock" stroke="var(--primary)" fill="var(--primary)" fillOpacity={0.15} />
                <Area dataKey="used" name="Units used" stroke="var(--accent)" fill="var(--accent)" fillOpacity={0.2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Panel>
        <Panel>
          <h3 className="mb-4 font-semibold">Units by category</h3>
          <Donut data={cats} />
        </Panel>
        <Panel>
          <h3 className="mb-4 font-semibold">Stock health</h3>
          <Donut data={health} colors={["var(--success)", "var(--warning)", "var(--destructive)"]} />
        </Panel>
        <Panel className="lg:col-span-2">
          <h3 className="mb-4 font-semibold">Recent scans</h3>
          {scans.length === 0 ? <p className="text-sm text-muted-foreground">No scans yet.</p> : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {scans.map((s) => (
                <div key={s.id} className="overflow-hidden rounded-lg border border-border">
                  <img src={s.image} alt="Scanned items" className="aspect-video w-full object-cover" />
                  <div className="p-3 text-xs">
                    <p className="font-mono-x text-muted-foreground">s3://visionstock/{s.s3Key}</p>
                    <p className="mt-1">{s.items.map((i) => `${i.name} ×${i.count}`).join(", ")}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Panel>
      </div>
    </>
  );
}

function Donut({ data, colors = COLORS }: { data: { name: string; value: number }[]; colors?: string[] }) {
  return (
    <div className="h-64">
      <ResponsiveContainer>
        <PieChart>
          <Pie data={data} dataKey="value" nameKey="name" innerRadius={55} outerRadius={90} paddingAngle={2}>
            {data.map((_, i) => <Cell key={i} fill={colors[i % colors.length]} />)}
          </Pie>
          <Tooltip /><Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
