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

/** Save a public avatar candidate through the authenticated server boundary. */
export async function provisionSignedInUserAvatar(
  source: string
): Promise<string> {
  const normalizedSource = String(source || '').trim()
  if (!normalizedSource) throw new Error('An avatar source is required.')
  if (normalizedSource === USER_ECOSYSTEM_AVATAR_SRC) {
    return USER_ECOSYSTEM_AVATAR_SRC
  }

  const imageResponse = await fetch(proxiedSource(normalizedSource), {
    cache: 'no-store',
  })
  if (!imageResponse.ok) {
    throw new Error(
      `Avatar image could not be loaded (${imageResponse.status}).`
    )
  }
  const image = await imageResponse.blob()
  if (!image.type.startsWith('image/')) {
    throw new Error('Avatar source did not return an image.')
  }

  const user = await useRequireUser()
  const token = await user.getIdToken()
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
    throw new Error(detail || `Avatar could not be saved (${response.status}).`)
  }
  return payload.avatar
}
