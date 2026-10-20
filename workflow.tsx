import { createFileRoute } from "@tanstack/react-router";
import { Bell, CheckSquare, Cloud, Cpu, Database, Upload } from "lucide-react";
import { useStore } from "@/lib/store";
import { PageHeader, Panel } from "@/components/AppShell";

export const Route = createFileRoute("/workflow")({
  head: () => ({
    meta: [
      { title: "How It Works — VisionStock AI" },
      { name: "description", content: "The OpenCV + AWS S3, DynamoDB and SNS workflow behind VisionStock AI." },
      { property: "og:title", content: "How It Works — VisionStock AI" },
      { property: "og:description", content: "OpenCV object detection connected to AWS cloud services." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Workflow,
});

const STEPS = [
  { icon: Upload, t: "Upload image", d: "User uploads a photo of items from phone or desktop." },
  { icon: Cloud, t: "Store in AWS S3", d: "Image is stored securely in a private S3 bucket." },
  { icon: Cpu, t: "OpenCV detection", d: "OpenCV processes the image to detect and count objects." },
  { icon: CheckSquare, t: "Confirm quantities", d: "Detected items are shown so the user can adjust counts." },
  { icon: Database, t: "Save to DynamoDB", d: "Inventory records are written to Amazon DynamoDB." },
  { icon: Bell, t: "Alert via SNS", d: "Amazon SNS notifies the user when stock hits its threshold." },
];

const STATUS = [["AWS S3", "Image storage"], ["OpenCV", "Object detection"], ["DynamoDB", "Inventory records"], ["SNS", "Notifications"]];

function Workflow() {
  const { resetDemo } = useStore();
  return (
    <>
      <PageHeader title="How It Works" sub="OpenCV + AWS architecture" />
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {STEPS.map(({ icon: Icon, t, d }, i) => (
          <Panel key={t}>
            <div className="flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-lg bg-primary text-primary-foreground"><Icon className="h-5 w-5" /></span>
              <span className="font-mono-x text-xs text-muted-foreground">STEP {i + 1}</span>
            </div>
            <h3 className="mt-3 font-semibold">{t}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{d}</p>
          </Panel>
        ))}
      </div>
      <Panel className="mt-6">
        <h3 className="mb-4 font-semibold">Integration status</h3>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {STATUS.map(([n, d]) => (
            <div key={n} className="rounded-lg border border-border p-3">
              <p className="font-medium">{n}</p>
              <p className="text-xs text-muted-foreground">{d}</p>
              <span className="mt-2 inline-block rounded-full bg-warning/20 px-2 py-0.5 text-xs font-medium">Demo — not connected</span>
            </div>
          ))}
        </div>
        <button onClick={resetDemo} className="mt-5 rounded-lg border border-border px-4 py-2 text-sm hover:bg-muted">Reset demo data</button>
      </Panel>
      <p className="mt-8 text-center text-xs text-muted-foreground">VisionStock AI · Created by Sk Seema</p>
    </>
  );
}
