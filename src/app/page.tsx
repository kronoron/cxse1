export default function Home() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-semibold">Welcome to CxSE</h1>
      <p className="text-zinc-400">Choose a role above or start a training session.</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <a href="/onboarding" className="rounded border border-zinc-800 p-4 hover:border-green-500">
          <h2 className="font-medium">Onboarding</h2>
          <p className="text-sm text-zinc-400">Upload docs and configure AI agents.</p>
        </a>
        <a href="/training" className="rounded border border-zinc-800 p-4 hover:border-green-500">
          <h2 className="font-medium">Training</h2>
          <p className="text-sm text-zinc-400">Run randomized call simulations.</p>
        </a>
      </div>
    </div>
  );
}
