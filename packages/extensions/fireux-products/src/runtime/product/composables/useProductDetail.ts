import { useLiveAsyncData } from 'fireux-core/runtime/composables/fireux/firestore/useLiveAsyncData'
import type { AsyncData, NuxtError } from 'nuxt/app'
import { computed, unref, type ComputedRef, type MaybeRef } from 'vue'
import type { Product, ProductPrice, ProductRead } from '../utils/product.ts'

export type ProductDetailOutcome = 'pending' | 'ready' | 'empty' | 'error'

type ProductDetailControls = Pick<
  AsyncData<unknown, NuxtError<unknown>>,
  'pending' | 'error' | 'refresh'
>

export type UseProductDetailReturn = ProductDetailControls & {
  product: ComputedRef<Product | null>
  prices: ComputedRef<ProductPrice[]>
  defaultPrice: ComputedRef<ProductPrice | null>
  ready: Promise<void>
  statusCode: ComputedRef<number>
  empty: ComputedRef<boolean>
  failed: ComputedRef<boolean>
  outcome: ComputedRef<ProductDetailOutcome>
}

function readStatusCode(error: unknown): number {
  if (!error || typeof error !== 'object') return 0
  const candidate = error as {
    status?: unknown
    statusCode?: unknown
    response?: { status?: unknown }
  }
  return Number(
    candidate.statusCode ?? candidate.status ?? candidate.response?.status ?? 0
  )
}

export function useProductDetail(
  productId: MaybeRef<string | null | undefined>
): UseProductDetailReturn {
  const id = computed(() => String(unref(productId) ?? '').trim())
  const state = useLiveAsyncData<ProductRead | null>(
    () => `product-detail|${id.value || 'none'}`,
    async (liveFetch) => {
      if (!id.value) return null
      return liveFetch<ProductRead>(
        `/api/products/${encodeURIComponent(id.value)}`
      )
    },
    { server: true, watch: [id] }
  )
  const product = computed<Product | null>(() => {
    const item = state.data.value?.product
    return item && item.id === id.value && !state.pending.value ? item : null
  })
  const prices = computed(() => state.data.value?.prices ?? [])
  const defaultPrice = computed(() => state.data.value?.defaultPrice ?? null)
  const statusCode = computed(() => readStatusCode(state.error.value))
  const empty = computed(
    () =>
      statusCode.value === 404 ||
      (!state.pending.value && !state.error.value && !product.value)
  )
  const failed = computed(
    () => Boolean(state.error.value) && statusCode.value !== 404
  )
  const outcome = computed<ProductDetailOutcome>(() => {
    if (state.pending.value) return 'pending'
    if (failed.value) return 'error'
    if (empty.value) return 'empty'
    return 'ready'
  })

  return {
    product,
    prices,
    defaultPrice,
    ready: state.then(() => undefined),
    pending: state.pending,
    error: state.error,
    refresh: state.refresh,
    statusCode,
    empty,
    failed,
    outcome,
  }
}
