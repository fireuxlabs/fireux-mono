<template>
  <ProviderFrame :title="toolTitle" :description="toolDescription">
    <MenuDirectoryCollection
      id="misebox-ordering-menus"
      :index="menuIndex"
      title="Published menus"
      description="Choose a Menu, then open one of its available guest order paths."
      :show-variant-toggle="false"
    />
  </ProviderFrame>
</template>

<script setup lang="ts">
import { useMenuDirectory } from 'fireux-kitchens/runtime/menu/composables/useMenuDirectory'

type ToolResponse = {
  tool: {
    title: string
    description: string
  }
}

const props = withDefaults(
  defineProps<{
    title?: string
    description?: string
  }>(),
  {
    title: '',
    description: '',
  }
)

const { data } = await useFetch<ToolResponse>('/api/tools/ordering')
const menuIndex = useMenuDirectory()

const toolTitle = computed(
  () => props.title || data.value?.tool.title || 'Misebox ordering'
)
const toolDescription = computed(
  () => props.description || data.value?.tool.description || ''
)
</script>
