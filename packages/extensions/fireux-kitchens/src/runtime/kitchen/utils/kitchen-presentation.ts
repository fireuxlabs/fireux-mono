import { readPlacePresentation, readPlaceCurrencyCode } from 'fireux-places/runtime/place/utils/place-spine'
import type { PlaceImageShade } from 'fireux-places/runtime/place/utils/place-spine'
import type { WorkspaceTheme } from 'fireux-core/types/theme'
import type { CurrencyDisplayFormat } from '../../models/shared/currency-display.model'
import { readKitchenThemePalette } from './kitchen-readers'

export function readKitchenPresentation(
  kitchenData: Record<string, unknown>,
  placeData: Record<string, unknown> = {}
): {
  name: string
  tagline: string
  imageUrl: string
  imageShade: PlaceImageShade
  logoImageUrl: string
  mediaBackdropColor: string
  wordmarkImageUrl: string
  currencyCode: string
  currencyFormat: CurrencyDisplayFormat
  showCurrency: boolean
  showItemImages: boolean
  kitchen_theme?: WorkspaceTheme
  placeLogoImageUrl: string
  placeWordmarkImageUrl: string
} {
  const place = readPlacePresentation(placeData)
  const currencyCode = readPlaceCurrencyCode(placeData)
  const workspacePalette = readKitchenThemePalette(kitchenData)

  return {
    name: place.name,
    tagline: place.tagline,
    imageUrl: place.imageUrl,
    imageShade: place.imageShade as PlaceImageShade,
    logoImageUrl: place.logoImage,
    mediaBackdropColor: place.mediaBackdropColor,
    placeLogoImageUrl: place.logoImage,
    placeWordmarkImageUrl: place.wordmarkImage,
    wordmarkImageUrl: place.wordmarkImage,
    currencyCode,
    currencyFormat: 'dash',
    showCurrency: true,
    showItemImages:
      (kitchenData.services as { item_images?: unknown } | undefined)?.item_images === true,
    ...(workspacePalette
      ? { kitchen_theme: { palette: workspacePalette } }
      : {}),
  }
}
