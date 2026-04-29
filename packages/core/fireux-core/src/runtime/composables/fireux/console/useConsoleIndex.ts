import { computed, reactive, ref, unref, watch, type ComputedRef, type Ref } from 'vue'
import { useUser } from '../firestore/core/user/useUser'
import { normalizeConsoleString } from './useConsole'

export type ConsoleMode = 'live' | 'demo' | 'test'

type MaybeRef<T> = Ref<T> | ComputedRef<T>

type ConsoleIndexUserContext = {
  avatarSrc: string
  displayName: string
}

type UseConsoleIndexOptions<TLive, TDemo, TTest> = {
  entities: MaybeRef<{
    live: (TLive | null | undefined)[] | null | undefined
    demo: (TDemo | null | undefined)[] | null | undefined
    test: TTest | null | undefined
  }>
  selectEntity: (id: string, mode?: ConsoleMode) => void
  getTestId: (item: TTest) => string
  autoCreateTest?: boolean
  testPending?: MaybeRef<boolean>
  testCreateKey?: MaybeRef<string | null | undefined>
  createTestEntity?: (context: {
    avatarSrc: string
    displayName: string
  }) => Promise<string | null | undefined>
}

export function useConsoleIndex<
  TLive,
  TDemo,
  TTest,
>(options: UseConsoleIndexOptions<TLive, TDemo, TTest>) {
  const { currentUser, avatarSrc } = useUser()
  const createTestEntity = options.createTestEntity

  const user = computed<ConsoleIndexUserContext>(() => ({
    avatarSrc: normalizeConsoleString(avatarSrc.value),
    displayName: normalizeConsoleString(currentUser.value?.display_name),
  }))

  const state = reactive({
    showSimulations: false,
    creatingTest: false,
  })
  const lastAutoCreateKey = ref('')

  const liveItems = computed<TLive[]>(() => {
    const source = unref(options.entities)
    return Array.isArray(source.live) ? (source.live as TLive[]) : []
  })

  const demoItems = computed<TDemo[]>(() => {
    const source = unref(options.entities)
    return Array.isArray(source.demo) ? (source.demo as TDemo[]) : []
  })

  const testItem = computed<TTest | null>(() => {
    const value = unref(options.entities).test
    return value && typeof value === 'object' && !Array.isArray(value)
      ? (value as TTest)
      : null
  })

  const entities = computed(() => ({
    live: liveItems.value,
    demo: demoItems.value,
    test: testItem.value,
  }))

  const autoCreateTest = computed(
    () => Boolean(options.autoCreateTest) && Boolean(createTestEntity)
  )
  const testPending = computed(() => Boolean(options.testPending ? unref(options.testPending) : false))
  const testCreateKey = computed(() =>
    normalizeConsoleString(options.testCreateKey ? unref(options.testCreateKey) : '')
  )

  const actions = {
    selectLive: (id: string) => {
      options.selectEntity(id, 'live')
    },
    selectDemo: (id: string) => {
      options.selectEntity(id, 'demo')
    },
    selectTest: () => {
      const item = testItem.value
      if (!item) return

      const id = normalizeConsoleString(options.getTestId(item))
      if (!id) return

      options.selectEntity(id, 'test')
    },
    createTest: createTestEntity
      ? async () => {
          if (state.creatingTest) return

          state.creatingTest = true

          try {
            const id = normalizeConsoleString(
              await createTestEntity({
                avatarSrc: user.value.avatarSrc,
                displayName: user.value.displayName,
              })
            )

            if (!id) return

            lastAutoCreateKey.value = testCreateKey.value
            options.selectEntity(id, 'test')
          } finally {
            state.creatingTest = false
          }
        }
      : undefined,
  }

  watch(
    () => ({
      enabled: autoCreateTest.value,
      pending: testPending.value,
      hasTest: Boolean(testItem.value),
      key: testCreateKey.value,
    }),
    async ({ enabled, pending, hasTest, key }) => {
      if (!enabled || pending || hasTest || state.creatingTest) return
      if (!key || lastAutoCreateKey.value === key) return

      await actions.createTest?.()
    },
    {
      immediate: true,
    }
  )

  return {
    state,
    user,
    entities,
    actions,
  }
}
