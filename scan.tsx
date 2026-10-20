import { createFileRoute, Link } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { CheckCircle2, Cloud, Cpu, Database, Loader2, Minus, Plus, Trash2, Upload } from "lucide-react";
import { toast } from "sonner";
import { useStore } from "@/lib/store";
import { PageHeader, Panel } from "@/components/AppShell";

export const Route = createFileRoute("/scan")({
  head: () => ({
    meta: [
      { title: "Scan Items — VisionStock AI" },
      { name: "description", content: "Upload an item photo to detect and count products with computer vision." },
      { property: "og:title", content: "Scan Items — VisionStock AI" },
      { property: "og:description", content: "Image upload, object detection and quantity confirmation." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Scan,
});

const LABELS = ["Rice Bag 5kg", "Milk Carton", "Soap Bar", "Cooking Oil 1L", "Toothpaste", "Biscuits Pack", "Tea Leaves", "Shampoo", "Eggs", "Bread"];
type Det = { name: string; count: number; conf: number; box: [number, number, number, number] };
const STEPS = [
  { label: "Uploading to AWS S3", icon: Cloud },
  { label: "OpenCV detecting objects", icon: Cpu },
  { label: "Counting items", icon: CheckCircle2 },
];

function shrink(file: File): Promise<string> {
  return new Promise((res) => {
    const img = new Image();
    img.onload = () => {
      const c = document.createElement("canvas");
      const s = Math.min(1, 640 / img.width);
      c.width = img.width * s; c.height = img.height * s;
      c.getContext("2d")?.drawImage(img, 0, 0, c.width, c.height);
      res(c.toDataURL("image/jpeg", 0.7));
    };
    img.src = URL.createObjectURL(file);
  });
}

function Scan() {
  const { addDetected } = useStore();
  const ref = useRef<HTMLInputElement>(null);
  const [img, setImg] = useState<string | null>(null);
  const [step, setStep] = useState(-1);
  const [dets, setDets] = useState<Det[]>([]);
  const [drag, setDrag] = useState(false);

  const run = async (f?: File) => {
    if (!f || !f.type.startsWith("image/")) return toast.error("Please choose an image file");
    const url = await shrink(f);
    setImg(url); setDets([]); setStep(0);
    for (let i = 1; i <= 3; i++) {
      await new Promise((r) => setTimeout(r, 900));
      setStep(i);
    }
    const picks = [...LABELS].sort(() => Math.random() - 0.5).slice(0, 2 + Math.floor(Math.random() * 3));
    setDets(picks.map((name) => ({
      name, count: 1 + Math.floor(Math.random() * 6), conf: 80 + Math.floor(Math.random() * 19),
      box: [5 + Math.random() * 55, 5 + Math.random() * 55, 18 + Math.random() * 20, 18 + Math.random() * 20],
    })));
  };

  const edit = (i: number, d: Partial<Det>) => setDets((x) => x.map((v, j) => (j === i ? { ...v, ...d } : v)));
  const confirm = () => {
    if (!img) return;
    addDetected(dets.filter((d) => d.count > 0).map(({ name, count }) => ({ name, count })), img);
    toast.success("Saved to DynamoDB (demo)", { description: `${dets.length} products updated` });
    setDets([]); setImg(null); setStep(-1);
  };
  const busy = step >= 0 && step < 3;

  return (
    <>
      <PageHeader title="Scan Items" sub="Upload a photo — detection is simulated (demo) until OpenCV is connected." />
      <div className="grid gap-6 lg:grid-cols-5">
        <Panel className="lg:col-span-3">
          <div
            onClick={() => !busy && ref.current?.click()}
            onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
            onDragLeave={() => setDrag(false)}
            onDrop={(e) => { e.preventDefault(); setDrag(false); run(e.dataTransfer.files[0]); }}
            className={`relative flex aspect-video cursor-pointer items-center justify-center overflow-hidden rounded-lg border-2 border-dashed ${drag ? "border-accent bg-accent/5" : "border-border bg-muted"}`}
          >
            {img ? (
              <>
                <img src={img} alt="Uploaded items" className="h-full w-full object-contain" />
                {busy && <div className="scan-line" />}
                {dets.map((d) => (
                  <div key={d.name} className="absolute rounded border-2 border-accent"
                    style={{ left: `${d.box[0]}%`, top: `${d.box[1]}%`, width: `${d.box[2]}%`, height: `${d.box[3]}%` }}>
                    <span className="absolute -top-5 left-0 whitespace-nowrap rounded bg-accent px-1.5 text-[10px] font-medium text-accent-foreground">{d.name} {d.conf}%</span>
                  </div>
                ))}
              </>
            ) : (
              <div className="text-center text-muted-foreground">
                <Upload className="mx-auto h-10 w-10" />
                <p className="mt-2 font-medium text-foreground">Drop an image or click to upload</p>
                <p className="text-xs">JPG, PNG up to 10MB</p>
              </div>
            )}
          </div>
          <input ref={ref} type="file" accept="image/*" className="hidden" onChange={(e) => run(e.target.files?.[0])} />
          {step >= 0 && (
            <ol className="mt-5 grid gap-2 sm:grid-cols-3">
              {STEPS.map((s, i) => {
                const Icon = s.icon;
                const done = step > i, active = step === i;
                return (
                  <li key={s.label} className={`flex items-center gap-2 rounded-lg border p-3 text-sm ${done ? "border-success/40 bg-success/10" : "border-border"}`}>
                    {active ? <Loader2 className="h-4 w-4 animate-spin text-accent" /> : <Icon className={`h-4 w-4 ${done ? "text-success" : "text-muted-foreground"}`} />}
                    {s.label}
                  </li>
                );
              })}
            </ol>
          )}
        </Panel>

        <Panel className="lg:col-span-2">
          <h3 className="font-semibold">Detected items</h3>
          <p className="mb-4 text-xs text-muted-foreground">Confirm or adjust quantities before saving.</p>
          {dets.length === 0 ? (
            <p className="rounded-lg bg-muted p-6 text-center text-sm text-muted-foreground">{busy ? "Analysing image…" : "No detections yet. Upload an image to start."}</p>
          ) : (
            <>
              <ul className="space-y-2">
                {dets.map((d, i) => (
                  <li key={d.name} className="flex items-center gap-2 rounded-lg border border-border p-2">
                    <div className="min-w-0 flex-1">
                      <input value={d.name} onChange={(e) => edit(i, { name: e.target.value })} className="w-full bg-transparent text-sm font-medium outline-none" />
                      <p className="text-xs text-muted-foreground">Confidence {d.conf}%</p>
                    </div>
                    <button aria-label="Decrease" onClick={() => edit(i, { count: Math.max(0, d.count - 1) })} className="grid h-7 w-7 place-items-center rounded bg-secondary"><Minus className="h-3 w-3" /></button>
                    <span className="w-6 text-center font-mono-x">{d.count}</span>
                    <button aria-label="Increase" onClick={() => edit(i, { count: d.count + 1 })} className="grid h-7 w-7 place-items-center rounded bg-secondary"><Plus className="h-3 w-3" /></button>
                    <button aria-label="Remove" onClick={() => setDets((x) => x.filter((_, j) => j !== i))} className="text-muted-foreground hover:text-destructive"><Trash2 className="h-4 w-4" /></button>
                  </li>
                ))}
              </ul>
              <button onClick={confirm} className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-primary py-2.5 font-medium text-primary-foreground hover:opacity-90">
                <Database className="h-4 w-4" />Confirm & save to inventory
              </button>
            </>
          )}
          <Link to="/inventory" className="mt-4 block text-center text-xs font-medium text-accent">Go to inventory →</Link>
        </Panel>
      </div>
    </>
  );
}
