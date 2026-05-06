import {
  useKitchenMenu,
  type KitchenMenuState,
} from './useKitchenMenu'

export {
  type KitchenMenuItemGroup,
  type KitchenMenuSectionView,
} from './kitchen-menu-view'

export type KitchenMenuSurfacePresentation = 'qr' | 'kiosk'
export type KitchenMenuSurfaceState = KitchenMenuState & Record<string, unknown>

export function useKitchenMenuSurface(): KitchenMenuSurfaceState {
  return useKitchenMenu() as KitchenMenuSurfaceState
}
