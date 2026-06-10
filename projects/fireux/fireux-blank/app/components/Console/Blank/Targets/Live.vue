<template>
  <section class="space-y-2">
    <pre>ConsoleBlankTargetsLive</pre>

    <BlankCollectionManager
      :collection="collection"
      :pending="pending"
      title="Choose Blank"
      description="Select the Blank target you want to work on."
      :action="true"
      :show-badges="false"
      @select="emit('select', $event)"
    />
  </section>
</template>

<script setup lang="ts">
import type { Blank } from '../../../../models/blank.model'

withDefaults(
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
</script>
