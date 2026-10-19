<template>
  <div class="grid min-w-0 gap-4">
    <UBreadcrumb :ui="{ list: 'flex-wrap' }" :items="breadcrumbs" />
    <header class="flex flex-wrap items-center justify-between gap-4">
      <h1 class="text-3xl font-semibold tracking-tight text-highlighted">
        {{ title }}
      </h1>
      <div v-if="$slots.actions" class="flex flex-wrap items-center gap-2">
        <slot name="actions" />
      </div>
    </header>
  </div>
</template>
<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from '#imports'
import { useNav } from 'fireux-core/runtime/composables/navigation/useNav'
import { useWorkspaceEntryCta } from 'fireux-core/runtime/composables/fireux/workspace/useWorkspaceEntryCta'
const props = defineProps<{ title: string }>()
const { workspaceEntryPath } = useWorkspaceEntryCta('kitchen')
const route = useRoute()
const navigation = useNav(['workspace'])
const breadcrumbs = computed(() => {
  const parent = navigation.items.value.find(
    (item) =>
      item.groupIndex &&
      item.children?.some((child) => child.to.split('#')[0] === route.path)
  )
  return [
    { label: 'Home', to: workspaceEntryPath.value },
    { label: 'Overview', to: '/workspace/kitchen/overview' },
    ...(parent ? [{ label: parent.label, to: parent.to }] : []),
    { label: props.title },
  ]
})
</script>
