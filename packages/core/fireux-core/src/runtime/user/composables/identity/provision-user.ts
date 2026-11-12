// Concurrent edit — 2026-07-20 11:52 CEST — Security spine: route membership creation, bootstrap, and removal through the trusted server boundary.
// Concurrent edit — 2026-07-20 13:10 CEST — User handle security pass: provision canonical User identity through the trusted reservation boundary.
// Concurrent edit — 2026-07-20 17:49 CEST — Repo Efficiency Pass 2 of 6: remove browser notification construction from the canonical create helpers.

import { updateUserHandle } from './update-user-handle'
import { userDisplayNameSeed } from '../../utils/display-name-seed'
import { USER_ECOSYSTEM_AVATAR_SRC } from '../../utils/user-avatar'
import { provisionSignedInUserAvatar } from './provision-user-avatar'
import { useAuth } from '../../../composables/fireux/firebase/useAuth'
import { captureCommandScope } from '../../../composables/fireux/commands/useCommandScope'

import type { UserHandleResult } from '../../models/user-handle'

type UserProvisioningOptions = {
  displayName?: string
  avatar?: string | null
}

type UserProvisioningResult = {
  created: boolean
  displayName: string
  handle: string
}

export async function provisionUserIdentity(
  uid: string,
  options: UserProvisioningOptions = {},
  isOwnerCurrent: () => boolean = () => true
): Promise<UserProvisioningResult> {
  const displayName = userDisplayNameSeed({ displayName: options.displayName })
  if (!displayName) {
    throw new Error('[provisionUserIdentity] Missing displayName')
  }
  const avatar = options.avatar
  const { currentUser } = useAuth()
  const scope = captureCommandScope([() => currentUser.value?.uid])
  const isCurrent = () =>
    scope.isCurrent() && isOwnerCurrent() && currentUser.value?.uid === uid
  const assertCurrent = () => {
    if (!isCurrent())
      throw new Error('The account context changed. Please try again.')
  }

  try {
    for (let attempt = 0; ; attempt += 1) {
      assertCurrent()
      let result: UserHandleResult
      try {
        result = await updateUserHandle(
          uid,
          makeHandle(displayName, uid, attempt),
          {
            display_name: displayName,
            avatar: USER_ECOSYSTEM_AVATAR_SRC,
          },
          isCurrent
        )
      } catch (error) {
        assertCurrent()
        const failure = error as {
          statusCode?: unknown
          data?: { code?: unknown }
        }
        if (
          attempt >= 4 ||
          failure?.statusCode !== 409 ||
          failure.data?.code !== 'USER_HANDLE_UNAVAILABLE'
        )
          throw error
        continue
      }
      assertCurrent()
      // Establish identity before optional upload; retries keep saved avatars.
      if (result.created && avatar) {
        await provisionSignedInUserAvatar(uid, avatar, isCurrent)
        assertCurrent()
      }
      return { created: result.created, displayName, handle: result.handle }
    }
  } finally {
    scope.stop()
  }
}

function makeHandle(displayName: string, uid: string, attempt: number) {
  const name = displayName
    .toLowerCase()
    .replaceAll(/[^a-z0-9]/g, '')
    .slice(0, 16)
  const discriminator = uid
    .toLowerCase()
    .replaceAll(/[^a-z0-9]/g, '')
    .slice(0, 8)
  if (!discriminator) throw new Error('[makeHandle] Unable to derive handle')
  // Reserve the UID portion before adding the name. All five candidates fit
  // the shared 30-character limit and pass through the normal handle validator.
  return `${name ? `${name}-` : ''}${discriminator}${attempt ? `-${attempt + 1}` : ''}`
}
