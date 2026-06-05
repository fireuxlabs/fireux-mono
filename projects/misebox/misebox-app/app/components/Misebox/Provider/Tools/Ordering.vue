<template>
  <MiseboxProviderFrame
    :title="toolTitle"
    :description="toolDescription"
    endpoint="/api/tools/ordering"
  >
    <div class="flex justify-center">
      <img
        src="/img/app/logo.png"
        alt="Misebox"
        class="h-24 w-24 object-contain"
      >
    </div>
  </MiseboxProviderFrame>
</template>

<script setup lang="ts">
type ToolResponse = {
  tool: {
    title: string
    description: string
  }
}

const props = withDefaults(defineProps<{
  title?: string
  description?: string
}>(), {
  title: '',
  description: '',
})

const { data } = await useFetch<ToolResponse>('/api/tools/ordering')

const toolTitle = computed(() =>
  props.title || data.value?.tool.title || 'Misebox ordering'
)
const toolDescription = computed(() =>
  props.description || data.value?.tool.description || ''
)
</script>
