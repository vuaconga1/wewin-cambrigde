import type { Session } from "next-auth";
import { ROLES } from "@/lib/constants/roles";

export function isStaffSession(session: Session | null) {
  return !!session?.user?.roles?.some(
    (role) =>
      (role.name === ROLES.TEACHER || role.name === ROLES.ADMIN) &&
      role.isDisabled !== true,
  );
}
