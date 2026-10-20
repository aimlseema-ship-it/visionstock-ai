import { createFileRoute } from "@tanstack/react-router";
import { BellRing, CheckCheck, Trash2 } from "lucide-react";
import { useStore } from "@/lib/store";
import { PageHeader, Panel } from "@/components/AppShell";

export const Route = createFileRoute("/alerts")({
  head: () => ({
    meta: [
      { title: "Low-Stock Alerts — VisionStock AI" },
      { name: "description", content: "Automatic low-stock notifications delivered via AWS SNS." },
      { property: "og:title", content: "Low-Stock Alerts — VisionStock AI" },
      { property: "og:description", content: "See every automatic low-stock alert." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Alerts,
});

function Alerts() {
  const { alerts, products, markAllRead, clearAlerts } = useStore();
  const low = products.filter((p) => p.qty <= p.threshold);
  return (
    <>
      <PageHeader title="Alerts" sub="Alerts fire automatically when quantity reaches the threshold. SNS delivery is simulated (demo)."
        action={<div className="flex gap-2">
          <button onClick={markAllRead} className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-sm"><CheckCheck className="h-4 w-4" />Mark read</button>
          <button onClick={clearAlerts} className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-sm"><Trash2 className="h-4 w-4" />Clear</button>
        </div>} />
      <div className="grid gap-6 lg:grid-cols-3">
        <Panel className="lg:col-span-2">
          <h3 className="mb-4 font-semibold">Notification history</h3>
          {alerts.length === 0 ? (
            <p className="text-sm text-muted-foreground">No alerts yet. Lower a product's quantity to its threshold in Inventory to trigger one.</p>
          ) : (
            <ul className="space-y-2">
              {alerts.map((a) => (
                <li key={a.id} className={`flex items-start gap-3 rounded-lg border p-3 ${a.read ? "border-border" : "border-destructive/40 bg-destructive/5"}`}>
                  <BellRing className="mt-0.5 h-4 w-4 text-destructive" />
                  <div className="flex-1 text-sm">
                    <p className="font-medium">{a.productName} is low — {a.qty} left (threshold {a.threshold})</p>
                    <p className="text-xs text-muted-foreground">{new Date(a.at).toLocaleString()} · Sent via AWS SNS (demo)</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Panel>
        <Panel>
          <h3 className="mb-4 font-semibold">Currently below threshold</h3>
          {low.length === 0 ? <p className="text-sm text-muted-foreground">Nothing is low.</p> : (
            <ul className="space-y-2 text-sm">
              {low.map((p) => (
                <li key={p.id} className="flex justify-between rounded-lg bg-muted px-3 py-2"><span>{p.name}</span><span className="font-mono-x text-destructive">{p.qty}/{p.threshold}</span></li>
              ))}
            </ul>
          )}
        </Panel>
      </div>
    </>
  );
}
