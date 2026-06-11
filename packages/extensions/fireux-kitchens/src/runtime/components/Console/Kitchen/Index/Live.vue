<template>
  <section class="space-y-2">
    <pre>ConsoleKitchenIndexLive</pre>

    <KitchenCollectionManager
      :collection="managerCollection"
      :console-ids="kitchenConsoleUser.consoleKitchenIds"
      :action-ids="kitchenConsoleUser.consoleKitchenIds"
      v-model:filter-mode="liveMode"
      :filter-options="liveModeOptions"
      :show-filter-toggle="liveModeOptions.length > 1"
      :title="managerTitle"
      :description="managerDescription"
      :link="false"
      :action="true"
      :disabled="false"
      :show-badges="false"
      @select="selectConsoleKitchen"
    />

    <DevFireuxDebugPanel
      title="Kitchen live user debug"
      scope="console"
      :data="userDebug"
      :default-open="false"
    />
  </section>
</template>

<script setup lang="ts">
import { computed, ref, watchEffect } from 'vue'
import { useConsoleIndexPolicy } from 'fireux-core/runtime/composables/fireux/app/console/useConsoleIndexPolicy'
import { useUser } from 'fireux-core/runtime/composables/fireux/firestore/core/user/useUser'
import { useKitchenUserComputed } from '../../../../composables/fireux/console/kitchen/index/useKitchenUserComputed'
import { useKitchenCollection } from '../../../../composables/fireux/firestore/kitchen/fetch/useKitchenCollection'
import type { KitchenSurface } from '../../../../composables/fireux/firestore/kitchen/utils/view/useKitchenInterface'

type LiveMode = 'mine' | 'console'

const props = withDefaults(
  defineProps<{
    collection?: KitchenSurface[]
  }>(),
  {
    collection: () => [],
  }
)

const emit = defineEmits<{
  (event: 'select', id: string): void
}>()

const policy = useConsoleIndexPolicy({ family: 'kitchen' })
const user = useUser()
const liveMode = ref<LiveMode>('console')
const myKitchenIds = computed(() => user.coreUser.value?.myKitchens ?? [])
const myKitchenCollection = useKitchenCollection({ ids: myKitchenIds })
const scopeDebug = computed(() =>
  props.collection.map((kitchen) => ({
    id: kitchen.id,
    team_ids: kitchen.team_ids,
  }))
)
const { kitchenConsoleUser } = useKitchenUserComputed(scopeDebug)
const liveModeOptions = computed(() =>
  policy.value.appBound
    ? [{ value: 'console', label: 'Kitchen console' }]
    : [
        { value: 'console', label: 'Kitchen consoles' },
        { value: 'mine', label: 'My kitchens' },
      ]
)
watchEffect(() => {
  if (policy.value.appBound) liveMode.value = 'console'
})
const managerTitle = computed(() =>
  liveMode.value === 'mine' ? 'My Kitchens' : 'Choose Kitchen'
)
const managerDescription = computed(() =>
  liveMode.value === 'mine'
    ? 'Kitchens from your personal kitchen list.'
    : policy.value.appBound
      ? 'Use the Kitchen console target linked to this app.'
      : 'Select the Kitchen console target you want to work on.'
)
const managerCollection = computed(() =>
  liveMode.value === 'mine' ? myKitchenCollection.kitchens.value : props.collection
)
function selectConsoleKitchen(id: string) {
  if (!kitchenConsoleUser.value.consoleKitchenIds.includes(id)) return
  emit('select', id)
}
const userDebug = computed(() => ({
  useUser: {
    pending: user.pending.value,
    coreUser: user.coreUser.value
      ? {
          id: user.coreUser.value.id,
          display_name: user.coreUser.value.display_name,
          adminOf: user.coreUser.value.adminOf,
          userOf: user.coreUser.value.userOf,
          myKitchens: user.coreUser.value.myKitchens,
        }
      : null,
    appUser: user.appUser.value
      ? {
          id: user.appUser.value.id,
          role: user.appUser.value.role,
          is_premium: user.appUser.value.is_premium,
          console_enabled: user.appUser.value.console_enabled,
        }
      : null,
  },
  useKitchenUserComputed: {
    ...kitchenConsoleUser.value,
    policy: policy.value,
    liveMode: liveMode.value,
    myKitchenRenderedCount: myKitchenCollection.kitchens.value.length,
    renderedCount: props.collection.length,
  },
}))
</script>
