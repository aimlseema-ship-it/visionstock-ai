import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Pencil, Plus, Search, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useStore, type Product } from "@/lib/store";
import { PageHeader, Panel } from "@/components/AppShell";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export const Route = createFileRoute("/inventory")({
  head: () => ({
    meta: [
      { title: "Inventory — VisionStock AI" },
      { name: "description", content: "Add, edit and delete products and set low-stock thresholds." },
      { property: "og:title", content: "Inventory — VisionStock AI" },
      { property: "og:description", content: "Manage your product inventory and stock thresholds." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Inventory,
});

type Form = { id?: string; name: string; category: string; qty: number; threshold: number };
const empty: Form = { name: "", category: "Groceries", qty: 0, threshold: 3 };

function Inventory() {
  const { products, upsert, remove } = useStore();
  const [q, setQ] = useState("");
  const [form, setForm] = useState<Form | null>(null);
  const list = products.filter((p) => (p.name + p.category).toLowerCase().includes(q.toLowerCase()));

  const save = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form || !form.name.trim()) return toast.error("Name is required");
    upsert({ ...form, name: form.name.trim() });
    toast.success(form.id ? "Product updated" : "Product added");
    setForm(null);
  };

  return (
    <>
      <PageHeader title="Inventory" sub="Records stored in DynamoDB (demo: saved in your browser)"
        action={<button onClick={() => setForm(empty)} className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"><Plus className="h-4 w-4" />Add product</button>} />
      <Panel className="p-0">
        <div className="flex items-center gap-2 border-b border-border p-4">
          <Search className="h-4 w-4 text-muted-foreground" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search products…" className="flex-1 bg-transparent text-sm outline-none" />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted text-left text-xs uppercase text-muted-foreground">
              <tr><th className="p-3">Product</th><th className="p-3">Category</th><th className="p-3">Qty</th><th className="p-3">Threshold</th><th className="p-3">Status</th><th className="p-3 text-right">Actions</th></tr>
            </thead>
            <tbody>
              {list.map((p) => <Row key={p.id} p={p} onEdit={() => setForm(p)} onDelete={() => { remove(p.id); toast("Product deleted"); }} />)}
              {list.length === 0 && <tr><td colSpan={6} className="p-8 text-center text-muted-foreground">No products found.</td></tr>}
            </tbody>
          </table>
        </div>
      </Panel>

      <Dialog open={!!form} onOpenChange={(o) => !o && setForm(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>{form?.id ? "Edit product" : "Add product"}</DialogTitle></DialogHeader>
          {form && (
            <form onSubmit={save} className="grid gap-3">
              <Field label="Name"><input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input-x" /></Field>
              <Field label="Category"><input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="input-x" /></Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Quantity"><input type="number" min={0} value={form.qty} onChange={(e) => setForm({ ...form, qty: Math.max(0, +e.target.value) })} className="input-x" /></Field>
                <Field label="Low-stock threshold"><input type="number" min={0} value={form.threshold} onChange={(e) => setForm({ ...form, threshold: Math.max(0, +e.target.value) })} className="input-x" /></Field>
              </div>
              <button className="mt-2 rounded-lg bg-primary py-2.5 font-medium text-primary-foreground">Save</button>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="grid gap-1 text-sm font-medium">{label}{children}</label>;
}

function Row({ p, onEdit, onDelete }: { p: Product; onEdit: () => void; onDelete: () => void }) {
  const low = p.qty <= p.threshold;
  return (
    <tr className="border-t border-border hover:bg-muted/50">
      <td className="p-3 font-medium">{p.name}</td>
      <td className="p-3 text-muted-foreground">{p.category}</td>
      <td className="p-3 font-mono-x">{p.qty}</td>
      <td className="p-3 font-mono-x text-muted-foreground">{p.threshold}</td>
      <td className="p-3">
        <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${p.qty === 0 ? "bg-destructive text-destructive-foreground" : low ? "bg-destructive/10 text-destructive" : "bg-success/15 text-success"}`}>
          {p.qty === 0 ? "Out of stock" : low ? "Low stock" : "In stock"}
        </span>
      </td>
      <td className="p-3 text-right">
        <button aria-label="Edit" onClick={onEdit} className="mr-2 text-muted-foreground hover:text-primary"><Pencil className="h-4 w-4" /></button>
        <button aria-label="Delete" onClick={onDelete} className="text-muted-foreground hover:text-destructive"><Trash2 className="h-4 w-4" /></button>
      </td>
    </tr>
  );
}
