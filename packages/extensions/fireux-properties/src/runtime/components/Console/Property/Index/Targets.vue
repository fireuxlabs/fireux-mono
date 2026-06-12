<template>
  <section class="space-y-2">
    <pre>ConsolePropertyIndexTargets</pre>

    <PropertyCollectionManager
      :collection="collection"
      :pending="pending"
      :console-ids="consoleIds"
      :action-ids="consoleIds"
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
import { computed } from 'vue'
import type { Property } from '../../../../models/property.model'

const props = withDefaults(
  defineProps<{
    collection?: Property[]
    pending?: boolean
  }>(),
  {
    collection: () => [],
    pending: false,
  }
)

const emit = defineEmits<{
  (event: 'select', id: string): void
}>()

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
