<template>
  <section class="space-y-2">
    <pre>ConsolePropertyIndexTargets</pre>

    <PropertyCollectionManager
      :collection="collection"
      :console-ids="consoleIds"
      :action-ids="consoleIds"
      v-model:filter-mode="targetMode"
      :filter-options="targetModeOptions"
      :show-filter-toggle="true"
      title="Choose Property"
      description="Select the Property console target you want to work on."
      :link="false"
      :action="true"
      :show-badges="false"
      @select="selectProperty"
    />
  </section>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import type { Property } from '../../../../models/property.model'

type TargetMode = 'console' | 'mine'

const props = withDefaults(
  defineProps<{
    collection?: Property[]
  }>(),
  {
    collection: () => [],
  }
)

const emit = defineEmits<{
  (event: 'select', id: string): void
}>()

const targetMode = ref<TargetMode>('console')
const targetModeOptions = [
  { value: 'console' as const, label: 'Property consoles' },
  { value: 'mine' as const, label: 'My properties' },
]
const consoleIds = computed(() =>
  props.collection
    .map((property) => String(property.id ?? '').trim())
    .filter(Boolean)
)
const consoleIdSet = computed(() => new Set(consoleIds.value))

function selectProperty(id: string) {
  const propertyId = String(id ?? '').trim()
  if (!consoleIdSet.value.has(propertyId)) return
  emit('select', propertyId)
}
</script>
