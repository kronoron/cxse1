import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions as any);
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const form = await req.formData();
  const id = String(form.get("id"));
  const status = String(form.get("status"));
  if (!id || !status) return NextResponse.json({ error: "Missing fields" }, { status: 400 });

  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const convo = await prisma.conversation.findUnique({ where: { id } });
  if (!convo || convo.userId !== user.id) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const updated = await prisma.conversation.update({
    where: { id },
    data: { status: status as any, updatedAt: new Date(), lastActiveAt: new Date() },
  });

  return NextResponse.redirect(new URL("/pipeline", req.url), 303);
}


