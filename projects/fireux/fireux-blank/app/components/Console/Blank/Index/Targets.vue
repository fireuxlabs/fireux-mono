<template>
  <section class="space-y-2">
    <pre>ConsoleBlankIndexTargets</pre>

    <BlankCollectionManager
      :collection="collection"
      :pending="pending"
      :action-ids="consoleBlankIds"
      title="Choose Blank"
      description="Select the Blank console target you want to work on."
      :action="true"
      :show-badges="false"
      @select="selectBlank"
    />
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Blank } from '../../../../models/blank.model'

const props = withDefaults(
  defineProps<{
    collection?: Blank[]
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

const text = (value: unknown) => String(value ?? '').trim()
const consoleBlankIds = computed(() =>
  props.collection.map((blank) => text(blank.id)).filter(Boolean)
)
const consoleBlankIdSet = computed(() => new Set(consoleBlankIds.value))
function selectBlank(id: string) {
  if (!consoleBlankIdSet.value.has(text(id))) return
  emit('select', id)
}
</script>
