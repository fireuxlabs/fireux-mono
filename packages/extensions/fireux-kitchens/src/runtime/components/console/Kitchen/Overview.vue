<template>
  <section class="console-surface">
    <div class="console-surface__grid console-surface__grid--2">
      <KitchenOverviewFocus :focus="focus" :group="group" />
      <KitchenOverviewGroup :group="group" :mode="focus.mode" />
    </div>

    <div v-if="isDev" class="mt-4">
      <DevJson
        title="Kitchen Overview Debug"
        context="console kitchen overview · selected kitchen header source"
        :data="debugState"
        :default-open="true"
        :hide-when-empty="false"
      />
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useKitchenConsoleOverview } from '../../../composables/fireux/app/kitchen-console/useKitchenConsoleOverview'

const { focus, group } = useKitchenConsoleOverview()
const isDev = import.meta.dev

const debugState = computed(() => {
  const kitchen = focus.value.entity
  const mode = focus.value.mode
  const headerSubtitleField = mode === 'live' ? 'formatted_address' : 'short_address'

  return {
    note: 'The top-left layout pill is the selected kitchen header.',
    focus: {
      id: focus.value.id,
      mode,
      hasSelection: focus.value.hasSelection,
    },
    headerSource: kitchen
      ? {
          titleField: 'name',
          title: kitchen.name,
          subtitleField: headerSubtitleField,
          subtitle:
            headerSubtitleField === 'formatted_address'
              ? kitchen.formatted_address
              : kitchen.short_address,
          imageUrlField: 'image_url',
          imageUrl: kitchen.image_url,
        }
      : null,
    selectedKitchen: kitchen,
    group: {
      count: group.value.count,
      ids: group.value.items.map((item) => item.id),
    },
  }
})
</script>
