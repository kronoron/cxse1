import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import Link from "next/link";

export const dynamic = "force-dynamic";

async function getData() {
  const user = await getCurrentUser();
  if (!user?.email) return { conversations: [] };
  const dbUser = await prisma.user.findUnique({ where: { email: user.email } });
  if (!dbUser) return { conversations: [] };

  // Auto-mark inactive if older than 14 days
  const cutoff = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);
  await prisma.conversation.updateMany({
    where: { userId: dbUser.id, status: "ACTIVE", lastActiveAt: { lt: cutoff } },
    data: { status: "INACTIVE" },
  });

  const conversations = await prisma.conversation.findMany({
    where: { userId: dbUser.id },
    orderBy: { updatedAt: "desc" },
  });
  return { conversations };
}

export default async function PipelinePage() {
  const { conversations } = await getData();
  const groups = {
    ACTIVE: conversations.filter((c) => c.status === "ACTIVE"),
    CLOSED_WON: conversations.filter((c) => c.status === "CLOSED_WON"),
    CLOSED_LOST: conversations.filter((c) => c.status === "CLOSED_LOST"),
    INACTIVE: conversations.filter((c) => c.status === "INACTIVE"),
  } as const;

  async function StatusSection({ title, keyName }: { title: string; keyName: keyof typeof groups }) {
    const items = groups[keyName];
    return (
      <section className="space-y-2">
        <h2 className="font-medium text-zinc-200">{title} ({items.length})</h2>
        <div className="grid gap-2">
          {items.map((c) => (
            <form key={c.id} className="flex items-center justify-between rounded border border-zinc-800 p-3"
              action={`/api/conversations/update-status`} method="post">
              <div>
                <div className="font-medium">{c.title}</div>
                <div className="text-xs text-zinc-500">Updated: {new Date(c.updatedAt).toLocaleString()}</div>
                <input type="hidden" name="id" value={c.id} />
              </div>
              <div className="flex gap-2">
                {keyName !== "ACTIVE" && (
                  <button className="text-sm border border-zinc-700 px-2 py-1 rounded" name="status" value="ACTIVE">Reopen</button>
                )}
                {keyName === "ACTIVE" && (
                  <>
                    <button className="text-sm border border-zinc-700 px-2 py-1 rounded" name="status" value="CLOSED_WON">Mark Won</button>
                    <button className="text-sm border border-zinc-700 px-2 py-1 rounded" name="status" value="CLOSED_LOST">Mark Lost</button>
                  </>
                )}
              </div>
            </form>
          ))}
          {items.length === 0 && <div className="text-sm text-zinc-500">No conversations</div>}
        </div>
      </section>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Pipeline</h1>
        <Link href="/training" className="text-sm text-green-400">Start New Simulation</Link>
      </div>
      {/* @ts-expect-error Async Server Component */}
      <StatusSection title="Active" keyName="ACTIVE" />
      {/* @ts-expect-error Async Server Component */}
      <StatusSection title="Closed Won" keyName="CLOSED_WON" />
      {/* @ts-expect-error Async Server Component */}
      <StatusSection title="Closed Lost" keyName="CLOSED_LOST" />
      {/* @ts-expect-error Async Server Component */}
      <StatusSection title="Inactive" keyName="INACTIVE" />
    </div>
  );
}


