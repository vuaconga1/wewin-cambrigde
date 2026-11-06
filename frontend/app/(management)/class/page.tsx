import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/app/api/auth/authOptions";
import { ClassListClient } from "@/app/components/class-management/class-list-client";
import { isStaffSession } from "@/app/components/class-management/staff";

export default async function ClassPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");
  if (!isStaffSession(session)) redirect("/");

  return <ClassListClient />;
}
