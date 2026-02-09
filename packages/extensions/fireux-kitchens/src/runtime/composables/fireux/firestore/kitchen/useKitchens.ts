import { useKitchenCollection } from './fetch/useKitchenCollection'

export interface UseKitchensOptions {
  collectionPath?: string
}

export function useKitchens<
  T extends Record<string, any> = Record<string, any>,
>(options: UseKitchensOptions = {}) {
  const { collectionPath, collection, count } = useKitchenCollection<T>(
    options.collectionPath ?? 'kitchens'
  )

  return { collectionPath, collection, count }
}
