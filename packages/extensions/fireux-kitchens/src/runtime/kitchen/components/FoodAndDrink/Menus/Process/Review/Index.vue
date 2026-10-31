<template>
  <div class="workspace-surface workspace-surface--compact">
    <KitchenFoodAndDrinkMenusProcessMediaReview
      :source="source"
      :result="result"
      :app-id="appId"
      :kitchen-id="kitchenId"
      :upload-id="uploadId"
      :auth-token="authToken"
    />
    <UAlert
      v-if="hasDestructiveOptionLoss"
      color="error"
      variant="soft"
      title="Confirm blocked"
      description="This draft would remove existing variants or add-ons. Reprocess or repair the draft before replacing the menu."
    />

    <div class="workspace-surface workspace-surface--compact">
      <KitchenFoodAndDrinkMenusProcessReviewApply
        :existing-menu-name="existingMenuName"
        :source="source"
        :result="result"
        :app-id="appId"
        :kitchen-id="kitchenId"
        :menu-id="menuId"
        :auth-token="authToken"
        :blocked="blocked || hasDestructiveOptionLoss"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  existingMenuName?: string
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
  props.flags.some(
    (flag) =>
      flag.code === 'variants-missing-in-extraction' ||
      flag.code === 'add-ons-missing-in-extraction'
  )
)
const record = (value: unknown): Record<string, unknown> =>
  value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {}
const uploadId = computed(() =>
  String(record(props.source).id || props.menuId).trim()
)
</script>
