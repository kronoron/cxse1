"use client";
import { useMemo, useState } from "react";
import { useSession, signIn } from "next-auth/react";

const industries = ["SaaS", "Healthcare", "Finance", "Retail"];
const roles = ["AE", "SDR", "BDR", "CSM", "AM", "SUPPORT"] as const;
const urgencies = ["Low", "Medium", "High"];
const objections = [
  "Too expensive",
  "No budget",
  "No need right now",
  "Send me an email",
  "We use a competitor",
];

function randomPick<T>(arr: readonly T[] | T[]) {
  return arr[Math.floor(Math.random() * arr.length)];
}

export default function TrainingPage() {
  const { status } = useSession();
  const [seed, setSeed] = useState(Date.now());
  const [customTitle, setCustomTitle] = useState("");
  const [customDesc, setCustomDesc] = useState("");

  const scenario = useMemo(() => {
    const industry = randomPick(industries);
    const role = randomPick(roles);
    const urgency = randomPick(urgencies);
    const objection = randomPick(objections);
    return {
      title: customTitle || `${role} call with ${industry} buyer`,
      description:
        customDesc ||
        `Customer with ${urgency.toLowerCase()} urgency. Primary objection: ${objection}. Conduct discovery and handle objections.`,
    };
  }, [seed, customTitle, customDesc]);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Training</h1>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded border border-zinc-800 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-medium">Randomized Scenario</h2>
            <button className="text-sm text-green-400" onClick={() => setSeed(Date.now())}>
              Reroll
            </button>
          </div>
          <p className="text-sm text-zinc-400">{scenario.title}</p>
          <p className="text-sm text-zinc-500">{scenario.description}</p>
        </div>
        <div className="rounded border border-zinc-800 p-4 space-y-3">
          <h2 className="font-medium">Custom Scenario</h2>
          <input
            value={customTitle}
            onChange={(e) => setCustomTitle(e.target.value)}
            placeholder="Title"
            className="w-full rounded bg-zinc-900 p-2 text-sm"
          />
          <textarea
            value={customDesc}
            onChange={(e) => setCustomDesc(e.target.value)}
            placeholder="Description"
            rows={4}
            className="w-full rounded bg-zinc-900 p-2 text-sm"
          />
          <button
            className="text-sm border border-zinc-700 px-3 py-2 rounded"
            onClick={async () => {
              if (status !== "authenticated") {
                await signIn();
                return;
              }
              await fetch("/api/scenarios", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  title: customTitle || "Custom Scenario",
                  description: customDesc || "",
                  role: "AE",
                }),
              });
              setSeed(Date.now());
              setCustomTitle("");
              setCustomDesc("");
            }}
          >
            Save Scenario
          </button>
        </div>
      </div>
    </div>
  );
}


