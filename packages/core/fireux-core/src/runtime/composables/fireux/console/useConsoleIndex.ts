import { computed, ref, unref, type ComputedRef, type Ref } from 'vue'
import { useUser } from '../firestore/core/user/useUser'

export type ConsoleMode = 'live' | 'demo' | 'test'

type MaybeRef<T> = Ref<T> | ComputedRef<T>

type ConsoleIndexUserContext = {
  avatarSrc: string
  displayName: string
}

type UseConsoleIndexOptions<TLive, TDemo, TSelected, TTest, TCard> = {
  entities: MaybeRef<{
    live: unknown
    demo: unknown
    test: unknown
  }>
  selectedEntity: MaybeRef<TSelected | null>
  selectedMode: MaybeRef<ConsoleMode>
  selectEntity: (id: string, mode?: ConsoleMode) => void
  toDemoCard: (item: TDemo) => TCard | null | undefined
  toSelectedCard: (
    item: TSelected,
    mode: ConsoleMode,
    user: ConsoleIndexUserContext
  ) => TCard | null | undefined
  toTestCard: (
    item: TTest,
    user: ConsoleIndexUserContext
  ) => TCard | null | undefined
  getTestId: (item: TTest) => string
}

const normalizeString = (value: unknown) => String(value ?? '').trim()

export function useConsoleIndex<
  TLive,
  TDemo,
  TSelected,
  TTest,
  TCard,
>(options: UseConsoleIndexOptions<TLive, TDemo, TSelected, TTest, TCard>) {
  const { currentUser, avatarSrc } = useUser()

  const user = computed<ConsoleIndexUserContext>(() => ({
    avatarSrc: normalizeString(avatarSrc.value),
    displayName: normalizeString(currentUser.value?.display_name),
  }))

  const showSimulations = ref(false)

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

  const demoCards = computed(() =>
    demoItems.value.map((item) => options.toDemoCard(item)).filter(Boolean)
  )

  const selectedCard = computed(() => {
    const item = unref(options.selectedEntity)
    if (!item) return null
    return (
      options.toSelectedCard(item, unref(options.selectedMode), user.value) ??
      null
    )
  })

  const testCard = computed(() => {
    const item = testItem.value
    if (!item) return null
    return options.toTestCard(item, user.value) ?? null
  })

  const selectDemoEntity = (id: string) => {
    options.selectEntity(id, 'demo')
  }

  const selectTestEntity = () => {
    const item = testItem.value
    if (!item) return

    const id = normalizeString(options.getTestId(item))
    if (!id) return

    options.selectEntity(id, 'test')
  }

  return {
    showSimulations,
    userAvatar: computed(() => user.value.avatarSrc),
    userDisplayName: computed(() => user.value.displayName),
    liveItems,
    demoItems,
    testItem,
    demoCards,
    selectedCard,
    testCard,
    selectDemoEntity,
    selectTestEntity,
  }
}
