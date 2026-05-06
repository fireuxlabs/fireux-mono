import {
  useKitchenMenu,
  type KitchenMenuState,
} from './useKitchenMenu'

export {
  type KitchenMenuItemGroup,
  type KitchenMenuSectionView,
} from './useKitchenMenu'

export type KitchenMenuSurfacePresentation = 'qr' | 'kiosk'
export type KitchenMenuSurfaceState = KitchenMenuState & Record<string, any>

export function useKitchenMenuSurface(): KitchenMenuSurfaceState {
  return useKitchenMenu() as KitchenMenuSurfaceState
}
