import { useRoute } from '#imports'
import { computed, unref, type ComputedRef, type Ref } from 'vue'

type MaybeRef<T> = T | Ref<T> | ComputedRef<T>

export type CollectionRouteResolver = (id: string) => string

export type CollectionRouteContextOptions = {
  collectionKey: MaybeRef<string>
  baseRoute?: MaybeRef<string | undefined>
  resolveTo?: MaybeRef<CollectionRouteResolver | undefined>
}

export type ResolveCollectionItemRouteOptions = {
  collectionKey: string
  id: string
  currentPath?: string
  baseRoute?: string
}

const trimSlashes = (value: unknown): string =>
  String(value || '')
    .trim()
    .replace(/^\/+|\/+$/g, '')

const normalizeBaseRoute = (value: unknown): string => {
  const segment = trimSlashes(value)
  return segment ? `/${segment}` : ''
}

export const resolveCollectionBaseRoute = (
  collectionKey: string,
  currentPath = ''
): string => {
  const collectionSegment = trimSlashes(collectionKey)
  if (!collectionSegment) return ''

  const path = normalizeBaseRoute(currentPath)
  const workspaceMatch = path.match(/^\/workspace\/([^/]+)/)
  if (workspaceMatch?.[1]) {
    return `/workspace/${workspaceMatch[1]}/${collectionSegment}`
  }

  return `/${collectionSegment}`
}

export const resolveCollectionItemRoute = (
  options: ResolveCollectionItemRouteOptions
): string => {
  const id = String(options.id || '').trim()
  if (!id) return ''

  const baseRoute = normalizeBaseRoute(
    options.baseRoute ||
      resolveCollectionBaseRoute(options.collectionKey, options.currentPath)
  )

  return baseRoute ? `${baseRoute}/${encodeURIComponent(id)}` : ''
}

export const useCollectionRouteContext = (
  options: CollectionRouteContextOptions
) => {
  const route = useRoute()

  const collectionKey = computed(() => String(unref(options.collectionKey) || '').trim())
  const baseRoute = computed(() =>
    normalizeBaseRoute(
      unref(options.baseRoute) ||
        resolveCollectionBaseRoute(collectionKey.value, route.path)
    )
  )

  const resolveTo = (id: string): string => {
    const customResolver = unref(options.resolveTo)
    if (customResolver) return customResolver(id)

    return resolveCollectionItemRoute({
      collectionKey: collectionKey.value,
      id,
      baseRoute: baseRoute.value,
      currentPath: route.path,
    })
  }

  return {
    route,
    collectionKey,
    baseRoute,
    resolveTo,
  }
}
