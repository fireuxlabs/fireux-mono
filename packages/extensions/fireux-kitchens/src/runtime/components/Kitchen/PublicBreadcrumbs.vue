<template>
  <UBreadcrumb :items="breadcrumbItems" />
</template>

<script setup lang="ts">
import { computed } from 'vue'

type BreadcrumbItem = {
  label: string
  to?: string
}

const props = withDefaults(defineProps<{
  kitchenName?: string
  kitchenSlug?: string
  menuName?: string
  current?: 'kitchen' | 'menus' | 'menu'
}>(), {
  kitchenName: 'Kitchen',
  kitchenSlug: '',
  menuName: 'Menu',
  current: 'kitchen',
})

const text = (value: unknown) => String(value ?? '').trim()
const kitchenName = computed(() => text(props.kitchenName) || 'Kitchen')
const kitchenSlug = computed(() => text(props.kitchenSlug))
const kitchenPath = computed(() =>
  kitchenSlug.value
    ? `/kitchens/${encodeURIComponent(kitchenSlug.value)}`
    : '/kitchens'
)
const menusPath = computed(() => `${kitchenPath.value}/menus`)

const breadcrumbItems = computed<BreadcrumbItem[]>(() => {
  if (props.current === 'kitchen') {
    return [{
      label: kitchenName.value,
    }]
  }

  const items: BreadcrumbItem[] = [{
    label: kitchenName.value,
    to: kitchenPath.value,
  }]

  if (props.current === 'menus') {
    items.push({
      label: 'Menus',
    })
    return items
  }

  items.push({
    label: 'Menus',
    to: menusPath.value,
  })
  items.push({
    label: text(props.menuName) || 'Menu',
  })

  return items
})
</script>
