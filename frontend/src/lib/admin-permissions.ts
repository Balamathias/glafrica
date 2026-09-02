import type { AdminUser } from "./admin-store"

/**
 * UI-side mirror of `UserProfile.ROLE_PERMISSIONS` in `backend/api/models.py`.
 *
 * This exists only to decide what to *show* — every endpoint enforces the same
 * rules server-side via the `CanManage*` permission classes. Keep the two in
 * step: a stale entry here hides a working feature or shows a broken one, but
 * it can never grant access.
 */
const ROLE_PERMISSIONS: Record<string, string[]> = {
  superadmin: ["*"],
  admin: [
    "livestock.view",
    "livestock.add",
    "livestock.change",
    "livestock.delete",
    "category.view",
    "category.add",
    "category.change",
    "category.delete",
    "tag.view",
    "tag.add",
    "tag.change",
    "tag.delete",
    "media.view",
    "media.add",
    "media.delete",
    "analytics.view",
    "certificate.view",
    "certificate.add",
    "certificate.change",
    "certificate.delete",
    "course.view",
    "course.add",
    "course.change",
    "course.delete",
    "sitefigure.view",
    "sitefigure.change",
  ],
  // The secretary runs on this role — see the note in the backend model.
  staff: [
    "livestock.view",
    "livestock.add",
    "livestock.change",
    "category.view",
    "tag.view",
    "tag.add",
    "media.view",
    "media.add",
    "certificate.view",
    "certificate.add",
    "certificate.change",
    "certificate.delete",
    "course.view",
    "course.add",
    "course.change",
  ],
  viewer: [
    "livestock.view",
    "category.view",
    "tag.view",
    "media.view",
    "analytics.view",
  ],
}

export function hasPermission(
  user: AdminUser | null | undefined,
  permission: string
): boolean {
  if (!user) return false
  if (user.is_superuser || user.role === "superadmin") return true

  const permissions = ROLE_PERMISSIONS[user.role] ?? []
  return permissions.includes("*") || permissions.includes(permission)
}
