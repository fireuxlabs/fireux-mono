import { createError } from 'h3'
import { isAdminMembership } from 'fireux-core/runtime/app/app-user/server/command-contract'

export function requireProductManager(member: {
  exists: boolean
  data?: Record<string, unknown>
}) {
  if (
    !member.exists ||
    !(isAdminMembership(member.data) || member.data?.canManageProducts === true)
  ) {
    throw createError({
      statusCode: 403,
      statusMessage: 'Product management access is required.',
    })
  }
}
