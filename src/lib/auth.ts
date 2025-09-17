import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";

export async function getCurrentSession() {
  return getServerSession(authOptions as any);
}

export async function getCurrentUser() {
  const session = await getServerSession(authOptions as any);
  return session?.user ?? null;
}


