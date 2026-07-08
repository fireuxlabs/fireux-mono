export type MenuKioskSkin = {
  id: string
  label: string
  backgroundImageUrl: string
  tone: 'dark' | 'light'
}

export const menuKioskSkins = [
  {
    id: 'spice-dark',
    label: 'Spice dark',
    backgroundImageUrl: '/_fireux/kitchens/img/kiosk/skins/spice-dark/background.png',
    tone: 'dark',
  },
] as const satisfies readonly MenuKioskSkin[]

export const menuKioskSkinById = (id: unknown) => {
  const skinId = String(id ?? '').trim()

  return menuKioskSkins.find((skin) => skin.id === skinId)
}
