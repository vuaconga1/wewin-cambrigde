import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/app/api/auth/authOptions";
import { UserManagementClient } from "@/app/components/users/user-management-client";
import { ROLES } from "@/lib/constants/roles";

export default async function UserManagementPage() {
  const session = await getServerSession(authOptions);

  if (!session) redirect("/login");

  const canAccess = session.user?.roles?.some(
    (role) => role.name === ROLES.TEACHER && role.isDisabled !== true,
  );

  if (!canAccess) redirect("/");

  return <UserManagementClient currentUserId={session.user.id} />;
}