import { useRequireUser } from './useRequireUser'

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

  const imageResponse = await fetch(proxiedSource(normalizedSource), {
    cache: 'no-store',
  })
  if (!imageResponse.ok) {
    throw new Error(`Avatar image could not be loaded (${imageResponse.status}).`)
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
    | UserAvatarProvisioningResponse
    | null
  if (!response.ok || payload?.ok !== true || !payload.avatar) {
    throw new Error(`Avatar could not be saved (${response.status}).`)
  }
  return payload.avatar
}
