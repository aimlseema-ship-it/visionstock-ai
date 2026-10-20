import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { toast } from "sonner";

export type Product = { id: string; name: string; category: string; qty: number; threshold: number; updatedAt: string };
export type AlertItem = { id: string; productName: string; qty: number; threshold: number; at: string; read: boolean };
export type ScanRecord = { id: string; at: string; image: string; s3Key: string; items: { name: string; count: number }[] };

const seedProducts = (): Product[] => {
  const now = new Date().toISOString();
  return [
    ["Rice Bag 5kg", "Groceries", 14, 5],
    ["Milk Carton", "Dairy", 3, 6],
    ["Soap Bar", "Personal Care", 22, 8],
    ["Cooking Oil 1L", "Groceries", 2, 4],
    ["Toothpaste", "Personal Care", 9, 4],
    ["Biscuits Pack", "Snacks", 31, 10],
    ["Tea Leaves", "Beverages", 6, 3],
    ["Shampoo", "Personal Care", 4, 4],
  ].map(([name, category, qty, threshold], i) => ({
    id: `p${i}`, name: name as string, category: category as string,
    qty: qty as number, threshold: threshold as number, updatedAt: now,
  }));
};

type Ctx = {
  products: Product[]; alerts: AlertItem[]; scans: ScanRecord[];
  upsert: (p: Omit<Product, "id" | "updatedAt"> & { id?: string }) => void;
  remove: (id: string) => void;
  addDetected: (items: { name: string; count: number }[], image: string) => void;
  markAllRead: () => void;
  clearAlerts: () => void;
  resetDemo: () => void;
};
const StoreCtx = createContext<Ctx | null>(null);
const uid = () => Math.random().toString(36).slice(2, 10);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<Product[]>(() => seedProducts());
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [scans, setScans] = useState<ScanRecord[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("visionstock-v2");
      if (raw) {
        const d = JSON.parse(raw);
        setProducts(d.products ?? seedProducts());
        setAlerts(d.alerts ?? []);
        setScans(d.scans ?? []);
      }
    } catch { /* ignore */ }
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    // keep only small scan thumbnails to stay under storage limits
    localStorage.setItem("visionstock-v2", JSON.stringify({ products, alerts, scans: scans.slice(0, 6) }));
  }, [products, alerts, scans, loaded]);

  const checkAlert = useCallback((before: Product | undefined, after: Product) => {
    const wasOk = !before || before.qty > before.threshold;
    if (after.qty <= after.threshold && wasOk) {
      setAlerts((a) => [{ id: uid(), productName: after.name, qty: after.qty, threshold: after.threshold, at: new Date().toISOString(), read: false }, ...a]);
      toast.warning(`Low stock: ${after.name}`, { description: `${after.qty} left (threshold ${after.threshold}). SNS alert sent (demo).` });
    }
  }, []);

  const upsert: Ctx["upsert"] = (p) => {
    const now = new Date().toISOString();
    setProducts((prev) => {
      const existing = p.id ? prev.find((x) => x.id === p.id) : undefined;
      const next: Product = { ...(existing ?? { id: uid() }), ...p, id: existing?.id ?? uid(), updatedAt: now } as Product;
      checkAlert(existing, next);
      return existing ? prev.map((x) => (x.id === next.id ? next : x)) : [next, ...prev];
    });
  };

  const remove = (id: string) => setProducts((p) => p.filter((x) => x.id !== id));

  const addDetected: Ctx["addDetected"] = (items, image) => {
    const now = new Date().toISOString();
    setProducts((prev) => {
      const next = [...prev];
      items.forEach((it) => {
        const i = next.findIndex((x) => x.name.toLowerCase() === it.name.toLowerCase());
        const cur = next[i];
        if (cur) next[i] = { ...cur, qty: cur.qty + it.count, updatedAt: now };
        else next.unshift({ id: uid(), name: it.name, category: "Detected", qty: it.count, threshold: 3, updatedAt: now });
      });
      return next;
    });
    setScans((s) => [{ id: uid(), at: now, image, s3Key: `uploads/${Date.now()}.jpg`, items }, ...s]);
  };

  return (
    <StoreCtx.Provider value={{
      products, alerts, scans, upsert, remove, addDetected,
      markAllRead: () => setAlerts((a) => a.map((x) => ({ ...x, read: true }))),
      clearAlerts: () => setAlerts([]),
      resetDemo: () => { setProducts(seedProducts()); setAlerts([]); setScans([]); },
    }}>
      {children}
    </StoreCtx.Provider>
  );
}

export function useStore() {
  const c = useContext(StoreCtx);
  if (!c) throw new Error("useStore outside provider");
  return c;
}
