import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/app/api/auth/authOptions";
import { VocabularyManagementClient } from "@/app/components/vocabulary/vocabulary-management-client";
import { ROLES } from "@/lib/constants/roles";

export default async function VocabularyManagementPage() {
  const session = await getServerSession(authOptions);

  if (!session) redirect("/login");

  const canAccess = session.user?.roles?.some(
    (role) => role.name === ROLES.TEACHER && role.isDisabled !== true,
  );

  if (!canAccess) redirect("/");

  return <VocabularyManagementClient />;
}