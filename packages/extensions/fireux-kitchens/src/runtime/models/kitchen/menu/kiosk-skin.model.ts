export type MenuKioskSkinBackgroundKey =
  | 'portraitLarge'
  | 'portraitCompact'
  | 'portraitPhone'

export type MenuKioskSkinBackground = {
  imageUrl: string
  width: number
  height: number
}

export type MenuKioskSkin = {
  id: string
  label: string
  backgroundImageUrl: string
  backgrounds?: Partial<Record<MenuKioskSkinBackgroundKey, MenuKioskSkinBackground>>
  primaryColor: string
  secondaryColor: string
  thumbnailImageUrl?: string
  tone: 'dark' | 'light'
}

export type MenuKioskSkinStatus = 'active' | 'draft' | 'archived'

export type MenuKioskSkinDoc = {
  id?: string
  label?: string
  background_image_url?: string
  backgrounds?: {
    portrait_large?: MenuKioskSkinBackgroundDoc
    portrait_compact?: MenuKioskSkinBackgroundDoc
    portrait_phone?: MenuKioskSkinBackgroundDoc
  }
  primary_color?: string
  secondary_color?: string
  thumbnail_image_url?: string
  tone?: 'dark' | 'light'
  status?: MenuKioskSkinStatus
  tags?: string[]
}

export type MenuKioskSkinBackgroundDoc = {
  image_url?: string
  width?: number
  height?: number
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
const positiveNumber = (value: unknown, fallback: number) => {
  const number = Number(value)

  return Number.isFinite(number) && number > 0 ? number : fallback
}
const backgroundFromDoc = (
  data: MenuKioskSkinBackgroundDoc | undefined,
  width: number,
  height: number
): MenuKioskSkinBackground | undefined => {
  const imageUrl = clean(data?.image_url)

  return imageUrl
    ? {
        imageUrl,
        width: positiveNumber(data?.width, width),
        height: positiveNumber(data?.height, height),
      }
    : undefined
}

export const menuKioskSkinFromDoc = (
  id: string,
  data: MenuKioskSkinDoc
): MenuKioskSkin | null => {
  const resolvedId = clean(data.id) || clean(id)
  const label = clean(data.label) || resolvedId
  const backgroundDocs = data.backgrounds ?? {}
  const backgrounds = {
    portraitLarge:
      backgroundFromDoc(backgroundDocs.portrait_large, 1080, 1920) ??
      backgroundFromDoc(
        { image_url: data.background_image_url },
        1080,
        1920
      ),
    portraitCompact: backgroundFromDoc(backgroundDocs.portrait_compact, 768, 1024),
    portraitPhone: backgroundFromDoc(backgroundDocs.portrait_phone, 390, 844),
  } satisfies Partial<Record<MenuKioskSkinBackgroundKey, MenuKioskSkinBackground>>
  const resolvedBackgrounds = Object.fromEntries(
    Object.entries(backgrounds).filter((entry): entry is [
      MenuKioskSkinBackgroundKey,
      MenuKioskSkinBackground,
    ] => Boolean(entry[1]))
  ) as Partial<Record<MenuKioskSkinBackgroundKey, MenuKioskSkinBackground>>
  const backgroundImageUrl =
    clean(data.background_image_url) ||
    resolvedBackgrounds.portraitLarge?.imageUrl ||
    resolvedBackgrounds.portraitCompact?.imageUrl ||
    resolvedBackgrounds.portraitPhone?.imageUrl ||
    ''
  const primaryColor = hexColor(data.primary_color)
  const secondaryColor = hexColor(data.secondary_color)
  const tone = data.tone === 'light' ? 'light' : 'dark'

  if (!resolvedId || !backgroundImageUrl || !primaryColor || !secondaryColor) return null

  return {
    id: resolvedId,
    label,
    backgroundImageUrl,
    ...(Object.keys(resolvedBackgrounds).length
      ? { backgrounds: resolvedBackgrounds }
      : {}),
    primaryColor,
    secondaryColor,
    ...(clean(data.thumbnail_image_url)
      ? { thumbnailImageUrl: clean(data.thumbnail_image_url) }
      : {}),
    tone,
  }
}
