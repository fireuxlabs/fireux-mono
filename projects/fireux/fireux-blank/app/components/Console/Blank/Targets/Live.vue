<template>
  <section class="space-y-2">
    <pre>ConsoleBlankTargetsLive</pre>

    <BlankCollectionManager
      :collection="managerCollection"
      :pending="pending"
      v-model:filter-mode="liveMode"
      :filter-options="liveModeOptions"
      :show-filter-toggle="true"
      :title="managerTitle"
      :description="managerDescription"
      :action="true"
      :show-badges="false"
      @select="emit('select', $event)"
    />

    <DevJson
      title="Blank live user debug"
      context="ConsoleBlankTargetsLive · current user source"
      :data="userDebug"
      :default-open="false"
    />
  </section>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useUser } from 'fireux-core/runtime/composables/fireux/firestore/core/user/useUser'
import type { Blank } from '../../../../models/blank.model'

type BlankLiveMode = 'console' | 'mine'

const props = withDefaults(
  defineProps<{
    collection?: Blank[]
    pending?: boolean
  }>(),
  {
    collection: () => [],
    pending: false,
  }
)

const emit = defineEmits<{
  (event: 'select', id: string): void
}>()

const text = (value: unknown) => String(value ?? '').trim()
const user = useUser()
const liveMode = ref<BlankLiveMode>('console')
const liveModeOptions = [
  { value: 'console' as const, label: 'Blank consoles' },
  { value: 'mine' as const, label: 'My blanks' },
]
const myBlankIds = computed(() =>
  (((user.coreUser.value as { myBlanks?: unknown[] } | null)?.myBlanks ?? [])
    .map(text)
    .filter(Boolean))
)
const myBlankIdSet = computed(() => new Set(myBlankIds.value))
const myBlankCollection = computed(() =>
  props.collection.filter((blank) => myBlankIdSet.value.has(text(blank.id)))
)
const managerCollection = computed(() =>
  liveMode.value === 'mine' ? myBlankCollection.value : props.collection
)
const managerTitle = computed(() =>
  liveMode.value === 'mine' ? 'My Blanks' : 'Choose Blank'
)
const managerDescription = computed(() =>
  liveMode.value === 'mine'
    ? 'Blank targets from your personal Blank list.'
    : 'Select the Blank console target you want to work on.'
)
const userDebug = computed(() => ({
  useUser: {
    pending: user.pending.value,
    coreUser: user.coreUser.value
      ? {
          id: user.coreUser.value.id,
          display_name: user.coreUser.value.display_name,
          myBlanks: myBlankIds.value,
        }
      : null,
  },
  blankConsoleSource: {
    liveMode: liveMode.value,
    blankConsoleCount: props.collection.length,
    myBlankCount: myBlankCollection.value.length,
    renderedCount: managerCollection.value.length,
  },
}))
</script>
