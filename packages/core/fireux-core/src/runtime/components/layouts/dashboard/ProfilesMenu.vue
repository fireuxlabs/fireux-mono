<!-- packages/core/fireux-core/src/runtime/components/layouts/dashboard/ProfilesMenu.vue -->
<template>
  <UDropdownMenu
    :items="items"
    :content="{ align: 'center', collisionPadding: 12 }"
    :ui="{ content: collapsed ? 'w-40' : 'w-(--reka-dropdown-menu-trigger-width)' }"
  >
    <UButton
      :label="collapsed ? undefined : selected?.label"
      :avatar="selected?.avatar"
      :icon="selected?.icon"
      :trailing-icon="collapsed ? undefined : 'i-lucide-chevrons-up-down'"
      color="neutral"
      variant="ghost"
      block
      :square="collapsed"
      class="data-[state=open]:bg-elevated"
      :class="[!collapsed && 'py-2']"
      :ui="{ trailingIcon: 'text-dimmed' }"
    />
  </UDropdownMenu>
</template>

<script setup lang="ts">
import type { DropdownMenuItem } from '@nuxt/ui'
import { computed } from 'vue'

const props = defineProps<{
  collapsed?: boolean
  profiles: Array<{
    id: string
    label: string
    avatar?: { src: string; alt?: string }
    icon?: string
  }>
  modelValue?: string | null
}>()

const emit = defineEmits<{
  'update:modelValue': [string | null]
  select: [string]
}>()

const selected = computed(() => {
  if (!props.profiles?.length) return null
  if (props.modelValue) return props.profiles.find(p => p.id === props.modelValue) ?? props.profiles[0]
  return props.profiles[0]
})

const items = computed<DropdownMenuItem[][]>(() => [[
  ...props.profiles.map(p => ({
    id: p.id,
    label: p.label,
    icon: p.icon,
    avatar: p.avatar,
    onSelect: () => {
      emit('update:modelValue', p.id)
      emit('select', p.id)
    }
  }))
]])
</script>