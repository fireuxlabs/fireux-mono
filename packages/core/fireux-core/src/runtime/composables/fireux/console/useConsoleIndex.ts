import { computed, reactive, toRef, unref, type ComputedRef, type Ref } from 'vue'
import { useUser } from '../firestore/core/user/useUser'

export type ConsoleMode = 'live' | 'demo' | 'test'

type MaybeRef<T> = Ref<T> | ComputedRef<T>

type ConsoleIndexUserContext = {
  avatarSrc: string
  displayName: string
}

type UseConsoleIndexOptions<TLive, TDemo, TTest> = {
  entities: MaybeRef<{
    live: unknown
    demo: unknown
    test: unknown
  }>
  selectEntity: (id: string, mode?: ConsoleMode) => void
  getTestId: (item: TTest) => string
}

const normalizeString = (value: unknown) => String(value ?? '').trim()

export function useConsoleIndex<
  TLive,
  TDemo,
  TTest,
>(options: UseConsoleIndexOptions<TLive, TDemo, TTest>) {
  const { currentUser, avatarSrc } = useUser()

  const user = computed<ConsoleIndexUserContext>(() => ({
    avatarSrc: normalizeString(avatarSrc.value),
    displayName: normalizeString(currentUser.value?.display_name),
  }))

  const state = reactive({
    showSimulations: false,
  })

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

      const id = normalizeString(options.getTestId(item))
      if (!id) return

      options.selectEntity(id, 'test')
    },
  }

  const selectDemoEntity = (id: string) => {
    actions.selectDemo(id)
  }

  const selectTestEntity = () => {
    actions.selectTest()
  }

  return {
    state,
    user,
    entities,
    actions,
    showSimulations: toRef(state, 'showSimulations'),
    userAvatar: computed(() => user.value.avatarSrc),
    userDisplayName: computed(() => user.value.displayName),
    liveItems,
    demoItems,
    testItem,
    selectLiveEntity: actions.selectLive,
    selectDemoEntity,
    selectTestEntity,
  }
}
