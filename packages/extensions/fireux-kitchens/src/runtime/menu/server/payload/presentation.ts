import { resolveEffectiveMenuTheme } from './theme'
import { menuSourceFromData } from './source'
import type { MenuPayloadScope } from './types'
import type { MenuKitchenPresentation } from '../../models/menu-detail.model'
const text = (value: unknown) => String(value ?? '').trim()
const kitchenImageShade = (value: unknown) => {
  const shade = text(value)
  return shade === 'light' || shade === 'dark' ? shade : undefined
}

export function menuPayloadPresentation(
  data: Record<string, unknown>,
  scope: MenuPayloadScope,
  kitchenOwned: boolean
): MenuKitchenPresentation {
  const source = menuSourceFromData(data, scope)
  const currencyCode = text(scope.currencyCode)
  const imageShade = kitchenImageShade(scope.kitchenImageShade)
  const resolvedTheme = resolveEffectiveMenuTheme(
    data,
    scope.kitchen_theme,
    kitchenOwned
  )
  return {
    ...(currencyCode ? { currencyCode } : {}),
    currencyFormat: scope.currencyFormat || 'dash',
    showCurrency: scope.showCurrency !== false,
    showItemImages: scope.showItemImages === true,
    ...(imageShade ? { kitchenImageShade: imageShade } : {}),
    ...(text(scope.kitchenImageUrl)
      ? { kitchenImageUrl: text(scope.kitchenImageUrl) }
      : {}),
    ...(/^#[0-9a-f]{6}$/i.test(text(scope.kitchenMediaBackdropColor))
      ? { kitchenMediaBackdropColor: text(scope.kitchenMediaBackdropColor) }
      : {}),
    ...(text(scope.kitchenLogoImageUrl)
      ? { kitchenLogoImageUrl: text(scope.kitchenLogoImageUrl) }
      : {}),
    kitchenName: source.kitchen_name || '',
    ...(text(scope.kitchenTagline)
      ? { kitchenTagline: text(scope.kitchenTagline) }
      : {}),
    ...(text(scope.kitchenWordmarkImageUrl)
      ? { kitchenWordmarkImageUrl: text(scope.kitchenWordmarkImageUrl) }
      : {}),
    ...resolvedTheme,
  }
}
