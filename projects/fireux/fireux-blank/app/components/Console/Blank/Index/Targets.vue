<template>
  <section class="space-y-2">
    <pre>ConsoleBlankIndexTargets</pre>

    <BlankCollectionManager
      :collection="managerCollection"
      :pending="managerPending"
      :action-ids="consoleBlankIds"
      v-model:filter-mode="targetMode"
      :filter-options="targetModeOptions"
      :show-filter-toggle="true"
      :title="managerTitle"
      :description="managerDescription"
      :action="true"
      :show-badges="false"
      @select="selectBlank"
    />

    <DevFireuxDebugPanel
      title="Blank target user debug"
      scope="console"
      :data="userDebug"
      :default-open="false"
    />
  </section>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useUser } from 'fireux-core/runtime/composables/fireux/firestore/core/user/useUser'
import { useBlankDocsByIds } from '../../../../composables/fireux/firestore/blank/useBlank'
import type { Blank } from '../../../../models/blank.model'

type BlankTargetMode = 'console' | 'mine'

const props = withDefaults(
  defineProps<{
    collection?: Blank[]
  }>(),
  {
    collection: () => [],
  }
)

const emit = defineEmits<{
  (event: 'select', id: string): void
}>()

const text = (value: unknown) => String(value ?? '').trim()
const user = useUser()
const targetMode = ref<BlankTargetMode>('console')
const targetModeOptions = [
  { value: 'console' as const, label: 'Blank consoles' },
  { value: 'mine' as const, label: 'My blanks' },
]
const myBlankIds = computed(() =>
  (((user.coreUser.value as { myBlanks?: unknown[] } | null)?.myBlanks ?? [])
    .map(text)
    .filter(Boolean))
)
const myBlanks = useBlankDocsByIds(myBlankIds)
const consoleBlankIds = computed(() =>
  props.collection.map((blank) => text(blank.id)).filter(Boolean)
)
const consoleBlankIdSet = computed(() => new Set(consoleBlankIds.value))
const myBlankCollection = computed(() =>
  myBlanks.blanks.value
)
const managerCollection = computed(() =>
  targetMode.value === 'mine' ? myBlankCollection.value : props.collection
)
const managerPending = computed(() =>
  targetMode.value === 'mine' ? myBlanks.pending.value : false
)
const managerTitle = computed(() =>
  targetMode.value === 'mine' ? 'My Blanks' : 'Choose Blank'
)
const managerDescription = computed(() =>
  targetMode.value === 'mine'
    ? 'Blank targets from your personal Blank list. Only team targets can be selected.'
    : 'Select the Blank console target you want to work on.'
)
function selectBlank(id: string) {
  if (!consoleBlankIdSet.value.has(text(id))) return
  emit('select', id)
}
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
    targetMode: targetMode.value,
    consoleBlankIds: consoleBlankIds.value,
    blankConsoleCount: consoleBlankIds.value.length,
    myBlankCount: myBlankCollection.value.length,
    renderedCount: managerCollection.value.length,
  },
}))
</script>
