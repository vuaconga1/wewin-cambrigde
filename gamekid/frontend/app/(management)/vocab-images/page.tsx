import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/app/api/auth/authOptions";
import { VocabImagesReviewClient } from "@/app/components/vocabulary/vocab-images-review-client";
import { ROLES } from "@/lib/constants/roles";

export default async function VocabImagesReviewPage() {
  const session = await getServerSession(authOptions);

  if (!session) redirect("/login");

  const canAccess = session.user?.roles?.some(
    (role) => role.name === ROLES.TEACHER && role.isDisabled !== true,
  );

  if (!canAccess) redirect("/");

  return <VocabImagesReviewClient />;
}