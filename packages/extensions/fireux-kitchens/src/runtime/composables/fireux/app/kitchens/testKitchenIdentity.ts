import { normalizeSlug } from 'fireux-core/runtime/utils/slug/normalizeSlug'

const TEST_KITCHEN_ADDRESS = '123 Sandbox Street'

const normalizeString = (value: unknown) => String(value || '').trim()

export const resolveTestKitchenFirstName = (
  displayName: unknown,
  uid: unknown
) => {
  const name = normalizeString(displayName)
  const firstName = name.split(/\s+/).find(Boolean)
  if (firstName) return firstName

  const userId = normalizeString(uid)
  return userId ? `User ${userId.slice(0, 6)}` : 'User'
}

export const resolveTestKitchenName = (displayName: unknown, uid: unknown) =>
  `${resolveTestKitchenFirstName(displayName, uid)}'s Test Kitchen`

export const resolveTestKitchenSlug = (displayName: unknown, uid: unknown) =>
  normalizeSlug(resolveTestKitchenName(displayName, uid)) || 'user-test-kitchen'

export const resolveTestKitchenShortAddress = () => TEST_KITCHEN_ADDRESS
