<template>
  <div class="flex min-h-full min-w-0 flex-1">
    <UDashboardPanel :id="navKey">
      <template #header
        ><LayoutsWorkspaceNavbar :title="index?.label || 'Kitchen'"
      /></template>
      <template #body>
        <section class="mx-auto grid w-full min-w-0 max-w-6xl gap-6">
          <UBreadcrumb
            :items="[
              { label: 'Home', to: workspaceEntryPath },
              { label: 'Overview', to: '/workspace/kitchen/overview' },
              { label: index?.label || 'Kitchen' },
            ]"
            :ui="{ list: 'flex-wrap' }"
          />
          <p v-if="index?.description" class="text-sm text-muted">
            {{ index.description }}
          </p>
          <slot />
          <div
            :aria-label="`${index?.label || 'Kitchen'} pages`"
            class="grid gap-4"
          >
            <UPageCard
              v-for="item in children"
              :key="item.to"
              :title="item.label"
              :to="item.to"
              :icon="item.icon || index?.icon"
            >
              <template #footer><slot name="child" :item="item" /></template>
            </UPageCard>
          </div>
          <UAlert
            v-if="notice"
            :title="notice"
            color="neutral"
            variant="subtle"
            icon="i-lucide-info"
          />
        </section>
      </template>
    </UDashboardPanel>
  </div>
</template>
<script setup lang="ts">
import { computed } from 'vue'
import { useNav } from 'fireux-core/runtime/composables/navigation/useNav'
import { useWorkspaceEntryCta } from 'fireux-core/runtime/composables/fireux/workspace/useWorkspaceEntryCta'
const props = defineProps<{ navKey: string; notice?: string }>()
const navigation = useNav(['workspace'])
const { workspaceEntryPath } = useWorkspaceEntryCta('kitchen')
const index = computed(() =>
  navigation.items.value.find((item) => item.key === props.navKey)
)
const children = computed(() =>
  index.value?.children || []
)
</script>
