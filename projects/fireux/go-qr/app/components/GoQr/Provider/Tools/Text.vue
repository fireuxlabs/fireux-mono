<template>
  <GoQrProviderFrame
    :title="toolTitle"
    :description="toolDescription"
    endpoint="/api/tools/text"
  >
    <p class="text-sm leading-6 text-muted">
      {{ message }}
    </p>
  </GoQrProviderFrame>
</template>

<script setup lang="ts">
import { computed } from 'vue'

type TextToolConfig = {
  copy?: {
    title?: string
    description?: string
  }
  content?: {
    message?: string
  }
}

const props = withDefaults(defineProps<{
  tool?: TextToolConfig | null
}>(), {
  tool: null,
})

const text = (value: unknown) => String(value ?? '').trim()
const toolTitle = computed(() => text(props.tool?.copy?.title))
const toolDescription = computed(() => text(props.tool?.copy?.description))
const message = computed(() => text(props.tool?.content?.message))
</script>
