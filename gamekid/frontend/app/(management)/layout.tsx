import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/app/api/auth/authOptions";
import { ManagementSidebar } from "@/app/components/management/management-sidebar";

export default async function ManagementLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session) redirect("/login");

  return (
    <div className="min-h-screen bg-slate-100 md:flex">
      <ManagementSidebar />
      <main className="min-h-screen flex-1 px-4 py-5 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
}
