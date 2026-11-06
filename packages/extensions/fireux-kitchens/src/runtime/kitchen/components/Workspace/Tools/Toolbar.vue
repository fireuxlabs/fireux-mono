<template>
  <KitchenPrepAndProductionStationsTools v-if="capability === 'stations'" />

  <section
    v-else-if="tools.length"
    class="workspace-surface workspace-surface--compact"
    :aria-labelledby="`${capability}-tools-title`"
  >
    <div
      class="flex flex-wrap items-center gap-3 rounded-xl border border-default bg-elevated/50 p-2 shadow-sm"
    >
      <div class="min-w-0 px-2">
        <h2 :id="`${capability}-tools-title`">Tools</h2>
        <p class="hidden sm:block">{{ title }} actions</p>
      </div>

      <UButton
        v-for="tool in tools"
        :key="tool.id"
        :label="tool.label"
        icon="i-lucide-plus"
        size="sm"
        @click="performAction(tool.id)"
      />
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { KitchenCapabilitySlug } from '../../../models/capability-tools'
import { kitchenCapabilities } from '../../../models/capabilities'
import { useKitchenCapabilityTools } from '../../../composables/workspace/useKitchenCapabilityTools'

const props = defineProps<{ capability: KitchenCapabilitySlug }>()
const { tools, performAction } = useKitchenCapabilityTools(props.capability)
const title = computed(
  () =>
    kitchenCapabilities.find((entry) => entry.slug === props.capability)
      ?.title || props.capability
)
</script>
