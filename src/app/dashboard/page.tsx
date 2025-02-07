import { redirect } from "next/navigation";
import { getServerAuthSession } from "@/server/auth";

export default async function DashboardPage() {
  const session = await getServerAuthSession();
  
  if (!session?.user) {
    redirect("/auth/signin");
  }

  const role = session.user.roles[0] || "user";
  redirect(`/dashboard/${role}`);
}
