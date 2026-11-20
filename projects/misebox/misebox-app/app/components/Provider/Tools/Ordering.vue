<template>
  <FireProviderToolFrame
    provider-name="Misebox"
    provider-url="https://misebox.app"
    logo-alt="Misebox"
    :title="toolTitle"
    :description="toolDescription"
  >
    <MenuCollection
      id="misebox-ordering-menus"
      :index="menuIndex"
      title="Published menus"
      description="Open a published Menu to browse food, drinks and prices."
      :show-variant-toggle="false"
    />
  </FireProviderToolFrame>
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
  () => props.title || data.value?.tool.title || 'Misebox menus'
)
const toolDescription = computed(
  () => props.description || data.value?.tool.description || ''
)
</script>
