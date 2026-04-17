import { computed, type ComputedRef, type Ref } from 'vue'

type MaybeRef<T> = Ref<T> | ComputedRef<T>

export type ConsoleXData<
  TData extends Record<string, unknown> = Record<string, unknown>,
> = {
  id: string
  isDemo: boolean
  pending: boolean
  pendingEntity: boolean
  pendingCollections: boolean
  ready: boolean
  data: TData
}

type ConsoleXDataSource<TData extends Record<string, unknown>> = {
  pendingEntity?: MaybeRef<boolean>
  pendingCollections?: MaybeRef<boolean>
  data: MaybeRef<TData>
}

type UseConsoleXDataParams<TData extends Record<string, unknown>> = {
  id: MaybeRef<string>
  isDemo: MaybeRef<boolean>
  live: () => ConsoleXDataSource<TData>
  demo: () => Pick<ConsoleXDataSource<TData>, 'data'>
}

export function useConsoleXData<TData extends Record<string, unknown>>(
  params: UseConsoleXDataParams<TData>
) {
  const live = params.live()
  const demo = params.demo()

  const pendingEntity = computed(() =>
    params.isDemo.value ? false : Boolean(live.pendingEntity?.value)
  )

  const pendingCollections = computed(() =>
    params.isDemo.value ? false : Boolean(live.pendingCollections?.value)
  )

  const pending = computed(
    () => pendingEntity.value || pendingCollections.value
  )

  const data = computed(() =>
    params.isDemo.value ? demo.data.value : live.data.value
  )

  const ready = computed(() => !pending.value)

  return computed<ConsoleXData<TData>>(() => ({
    id: String(params.id.value || '').trim(),
    isDemo: Boolean(params.isDemo.value),
    pending: pending.value,
    pendingEntity: pendingEntity.value,
    pendingCollections: pendingCollections.value,
    ready: ready.value,
    data: data.value,
  }))
}
