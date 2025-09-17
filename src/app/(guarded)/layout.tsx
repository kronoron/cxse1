import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function GuardedLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect("/signin");
  return <>{children}</>;
}


