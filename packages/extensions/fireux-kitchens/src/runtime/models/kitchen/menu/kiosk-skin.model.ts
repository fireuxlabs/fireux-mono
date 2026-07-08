export type MenuKioskSkin = {
  id: string
  label: string
  backgroundImageUrl: string
  primaryColor: string
  thumbnailImageUrl?: string
  tone: 'dark' | 'light'
}

export type MenuKioskSkinStatus = 'active' | 'draft' | 'archived'

export type MenuKioskSkinDoc = {
  id?: string
  label?: string
  background_image_url?: string
  primary_color?: string
  thumbnail_image_url?: string
  tone?: 'dark' | 'light'
  status?: MenuKioskSkinStatus
  tags?: string[]
}

export const MenuKioskSkinStorage = {
  appCollection: 'kiosk_skins',
} as const

const clean = (value: unknown) => String(value ?? '').trim()
const hexColor = (value: unknown) => {
  const color = clean(value)

  return /^#(?:[0-9a-f]{3}|[0-9a-f]{6}|[0-9a-f]{8})$/i.test(color)
    ? color
    : ''
}

export const menuKioskSkinFromDoc = (
  id: string,
  data: MenuKioskSkinDoc
): MenuKioskSkin | null => {
  const resolvedId = clean(data.id) || clean(id)
  const label = clean(data.label) || resolvedId
  const backgroundImageUrl = clean(data.background_image_url)
  const primaryColor = hexColor(data.primary_color)
  const tone = data.tone === 'light' ? 'light' : 'dark'

  if (!resolvedId || !backgroundImageUrl || !primaryColor) return null

  return {
    id: resolvedId,
    label,
    backgroundImageUrl,
    primaryColor,
    ...(clean(data.thumbnail_image_url)
      ? { thumbnailImageUrl: clean(data.thumbnail_image_url) }
      : {}),
    tone,
  }
}
