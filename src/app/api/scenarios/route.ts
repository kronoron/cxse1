import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions as any);
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json();
  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const scenario = await prisma.scenario.create({
    data: {
      title: body.title,
      description: body.description,
      role: body.role,
      industry: body.industry ?? null,
      companyId: user.companyId ?? null,
      createdById: user.id,
      isCustom: true,
    },
  });

  return NextResponse.json({ id: scenario.id });
}


