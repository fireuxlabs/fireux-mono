<template>
  <div class="space-y-4">
    <UAlert
      v-if="hasDestructiveOptionLoss"
      color="error"
      variant="soft"
      title="Confirm blocked"
      description="This draft would remove existing variants or add-ons. Reprocess or repair the draft before replacing the menu."
    />

    <UCollapsible :default-open="true">
      <UButton block color="neutral" variant="soft" trailing-icon="i-lucide-chevron-down">
        Confirm dishes
      </UButton>

      <template #content>
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
      </template>
    </UCollapsible>
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
