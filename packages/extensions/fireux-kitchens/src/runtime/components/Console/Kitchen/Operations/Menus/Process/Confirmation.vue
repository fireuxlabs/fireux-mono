<template>
  <div class="space-y-4">
    <UAlert
      v-if="hasDestructiveOptionLoss"
      color="error"
      variant="soft"
      title="Confirm blocked"
      description="This draft would remove existing variants or add-ons. Reprocess or repair the draft before replacing the menu."
    />

    <MoleculesDisclosurePanel title="Confirm dishes" :default-open="true">
      <div class="mt-3">
        <ConsoleKitchenOperationsMenusProcessConfirm
          :source="source"
          :result="result"
          :app-id="appId"
          :kitchen-id="kitchenId"
          :menu-id="menuId"
          :auth-token="authToken"
          :blocked="blocked || hasDestructiveOptionLoss"
        />
      </div>
    </MoleculesDisclosurePanel>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  source?: unknown | null
  result?: Record<string, unknown> | null
  appId: string
  kitchenId: string
  menuId: string
  authToken: string
  flags: Array<{ code: string }>
  blocked?: boolean
}>()

const hasDestructiveOptionLoss = computed(() =>
  props.flags.some((flag) =>
    flag.code === 'variants-missing-in-extraction' ||
    flag.code === 'add-ons-missing-in-extraction'
  )
)
</script>
