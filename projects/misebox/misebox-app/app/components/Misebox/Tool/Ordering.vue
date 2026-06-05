<template>
  <MiseboxSystemToolFrame
    :title="toolTitle"
    :description="toolDescription"
    endpoint="/api/tools/ordering"
  >
    <div class="grid min-h-72 place-items-center rounded-2xl border border-default bg-muted/40 p-8">
      <img
        src="/img/app/logo.png"
        alt="Misebox"
        class="h-24 w-24 rounded-2xl object-contain shadow-sm"
      >
    </div>
  </MiseboxSystemToolFrame>
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
