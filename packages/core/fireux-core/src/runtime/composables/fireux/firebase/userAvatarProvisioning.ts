import { useAuth } from './useAuth'
import { captureCommandScope } from '../commands/useCommandScope'
import { useRequireUser } from './useRequireUser'
import { USER_ECOSYSTEM_AVATAR_SRC } from '../../../user/utils/user-avatar'

type UserAvatarProvisioningResponse = {
  ok: true
  avatar: string
}

function proxiedSource(source: string) {
  return source.startsWith('/')
    ? source
    : `/api/proxy/image?url=${encodeURIComponent(source)}`
}

/** Upload and attach an avatar to the signed-in User through one trusted command. */
export async function provisionSignedInUserAvatar(
  userId: string,
  source: string | Blob
): Promise<string> {
  const { currentUser } = useAuth()
  const scope = captureCommandScope([() => currentUser.value?.uid])
  const assertCurrent = () => {
    if (!scope.isCurrent() || currentUser.value?.uid !== userId)
      throw new Error('The account context changed. Please try again.')
  }
  try {
    const user = await useRequireUser()
    if (!userId || user.uid !== userId) {
      throw new Error('You can only update your own profile.')
    }
    assertCurrent()
    let image: Blob
    if (typeof source === 'string') {
      const normalizedSource = source.trim()
      if (!normalizedSource) throw new Error('An avatar source is required.')
      if (normalizedSource === USER_ECOSYSTEM_AVATAR_SRC)
        return normalizedSource
      const imageResponse = await fetch(proxiedSource(normalizedSource), {
        cache: 'no-store',
      })
      if (!imageResponse.ok) {
        throw new Error(
          `Avatar image could not be loaded (${imageResponse.status}).`
        )
      }
      image = await imageResponse.blob()
      assertCurrent()
    } else {
      image = source
    }
    if (!image.type.startsWith('image/')) {
      throw new Error('Avatar source did not return an image.')
    }

    const token = await user.getIdToken()
    assertCurrent()
    const body = new FormData()
    body.append('avatar', image, 'avatar')
    const response = await fetch('/api/internal/user/avatar', {
      method: 'POST',
      headers: { authorization: `Bearer ${token}` },
      body,
    })
    const payload = (await response.json().catch(() => null)) as
      | (UserAvatarProvisioningResponse & {
          message?: unknown
          statusMessage?: unknown
        })
      | null
    if (!response.ok || payload?.ok !== true || !payload.avatar) {
      const detail = String(
        payload?.statusMessage || payload?.message || ''
      ).trim()
      throw new Error(
        detail || `Avatar could not be saved (${response.status}).`
      )
    }
    return payload.avatar
  } finally {
    scope.stop()
  }
}
