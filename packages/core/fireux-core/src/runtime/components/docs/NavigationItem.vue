<template>
  <li class="space-y-1">
    <NuxtLink
      :to="to"
      class="block px-2 py-1 text-sm"
      :class="
        isActive
          ? 'font-semibold text-primary'
          : 'text-default hover:text-primary'
      "
    >
      {{ title }}
    </NuxtLink>

    <ul v-if="children.length" class="ml-3 space-y-1 pl-2">
      <DocsNavigationItem
        v-for="child in children"
        :key="child.path || child._path || child.title"
        :item="child"
      />
    </ul>
  </li>
</template>

<script setup lang="ts">
import { computed } from 'vue'

type NavigationItem = {
  title?: string
  label?: string
  path?: string
  _path?: string
  children?: NavigationItem[]
}

const props = defineProps<{
  item: NavigationItem
}>()

defineOptions({ name: 'DocsNavigationItem' })

const route = useRoute()

const to = computed(() => props.item.path || props.item._path || '/docs')
const title = computed(() => props.item.title || props.item.label || 'Untitled')
const children = computed(() => props.item.children || [])

const isActive = computed(() => {
  const current = String(route.path || '')
  const target = String(to.value || '')
  if (!target) return false
  if (current === target) return true
  if (target === '/docs') return current.startsWith('/docs')
  return current.startsWith(`${target}/`)
})
</script>
