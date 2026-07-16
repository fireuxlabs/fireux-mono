import { computed, toValue, type MaybeRefOrGetter } from 'vue'
import { createError, useAsyncData } from '#imports'
import type {
  MenuDetailPayload,
  MenuDocumentPayload,
  MenuManifest,
} from '../../../models/kitchen/menu/menu-detail.model'
import type { MenuRouteContext } from '../../../models/kitchen/menu/menu-context.model'
import {
  menuRouteIndexPath,
  menuRoutePath,
  menuRouteQrPath,
  type MenuRouteScope,
} from '../../../utils/kitchen-menu-route'
import { normalizeMenuRouteContext } from '../../../utils/menu-context'

export type MenuRenderKind = 'document' | 'structured' | 'unavailable'

export type MenuLoadFailure = {
  statusCode: number
  title: string
  description: string
}

type UseMenuOptions = {
  routeScope: MaybeRefOrGetter<MenuRouteScope>
  menuContext?: MaybeRefOrGetter<MenuRouteContext | string | null | undefined>
}

type MenuRequestError = {
  status?: number
  statusCode?: number
  data?: {
    status?: number
    statusCode?: number
  }
}

function requestStatusCode(value: unknown) {
  const error = value as MenuRequestError
  const statusCode = Number(
    error?.statusCode ||
    error?.status ||
    error?.data?.statusCode ||
    error?.data?.status ||
    500
  )

  return Number.isInteger(statusCode) && statusCode >= 400 && statusCode <= 599
    ? statusCode
    : 500
}

function menuLoadFailure(statusCode: number): MenuLoadFailure {
  if (statusCode === 404) {
    return {
      statusCode,
      title: 'Menu not found',
      description: 'This menu does not exist or is not publicly available.',
    }
  }

  if (statusCode >= 500) {
    return {
      statusCode,
      title: 'Menu temporarily unavailable',
      description: 'This menu could not be loaded. Please try again shortly.',
    }
  }

  return {
    statusCode,
    title: 'Menu unavailable',
    description: 'This menu could not be opened.',
  }
}

export function useMenu(
  menuId: MaybeRefOrGetter<string>,
  options: UseMenuOptions
) {
  const id = computed(() => String(toValue(menuId) || '').trim())
  const routeScope = computed(() => toValue(options.routeScope))
  const kitchenSlug = computed(() =>
    routeScope.value.kind === 'directory'
      ? String(routeScope.value.kitchenSlug || '').trim()
      : ''
  )
  const menuContext = computed(() =>
    normalizeMenuRouteContext(toValue(options.menuContext))
  )
  const keyPart = (value: unknown) =>
    encodeURIComponent(String(value ?? '').trim())
  const key = computed(
    () =>
      [
        'menu',
        `scope=${routeScope.value.kind}`,
        `kitchen=${keyPart(kitchenSlug.value)}`,
        `id=${keyPart(id.value)}`,
        `context=${menuContext.value}`,
      ].join('|')
  )
  const indexPath = computed(() => menuRouteIndexPath(routeScope.value))
  const menuPath = computed(() =>
    menuRoutePath({
      scope: routeScope.value,
      menuId: id.value,
    })
  )
  const qrPath = computed(() =>
    menuRouteQrPath({
      scope: routeScope.value,
      menuId: id.value,
    })
  )
  const endpoint = computed(() => {
    if (!id.value) return ''

    const query = new URLSearchParams()
    if (kitchenSlug.value) query.set('kitchenSlug', kitchenSlug.value)
    if (menuContext.value !== 'generic') query.set('context', menuContext.value)

    const qs = query.toString()
    return `/api/menus/${encodeURIComponent(id.value)}${qs ? `?${qs}` : ''}`
  })
  const state = useAsyncData(
    key,
    async () => {
      if (!endpoint.value) return null

      try {
        return await $fetch<MenuDetailPayload>(endpoint.value)
      } catch (error) {
        const failure = menuLoadFailure(requestStatusCode(error))

        throw createError({
          statusCode: failure.statusCode,
          statusMessage: failure.title,
          message: failure.description,
        })
      }
    },
    { watch: [endpoint] }
  )
  const ready = state.then(() => undefined)
  const renderKind = computed<MenuRenderKind>(() => {
    if (state.pending.value || state.error.value || !state.data.value) {
      return 'unavailable'
    }
    return state.data.value.kind === 'document' ? 'document' : 'structured'
  })
  const document = computed<MenuDocumentPayload | null>(() =>
    renderKind.value === 'document' && state.data.value?.kind === 'document'
      ? state.data.value.document
      : null
  )
  const manifest = computed<MenuManifest | null>(() =>
    renderKind.value === 'structured' && state.data.value?.kind === 'manifest'
      ? state.data.value.manifest
      : null
  )
  const failure = computed<MenuLoadFailure | null>(() => {
    if (state.pending.value) return null
    if (state.error.value) {
      return menuLoadFailure(requestStatusCode(state.error.value))
    }
    return state.data.value ? null : menuLoadFailure(404)
  })

  return {
    id,
    routeScope,
    kitchenSlug,
    menuContext,
    indexPath,
    menuPath,
    qrPath,
    menu: state.data,
    renderKind,
    document,
    manifest,
    failure,
    pending: state.pending,
    error: state.error,
    ready,
  }
}
