<template>
  <UContainer class="space-y-6 py-10">
    <UBreadcrumb :items="[{ label: appName, to: '/' }, { label: 'Packages', to: '/packages' }, ...(selected ? [{ label: selected }] : [])]" />
    <UPageHeader :title="selected || 'Package library'" :description="selected ? packages.find((entry) => entry.name === selected)?.description : 'Packages used by this App.'" />
    <template v-if="selected">
      <UPageGrid v-if="examples.length">
        <UPageCard v-for="example in examples" :key="example.to" :title="example.title" :description="example.description" :to="example.to" icon="i-lucide-blocks" />
      </UPageGrid>
      <section class="space-y-3">
        <h2 class="text-xl font-semibold">Components · {{ componentNames.length }}</h2>
        <UInput v-if="componentNames.length" v-model="search" placeholder="Find a component" aria-label="Find a component" class="w-full sm:w-80" />
        <ul v-if="filteredComponents.length" class="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          <li v-for="name in filteredComponents" :key="name" class="rounded-lg border border-default p-3 break-words">
            <NuxtLink v-if="componentLinks[name]" :to="componentLinks[name]" class="font-medium text-primary hover:underline">{{ name }}</NuxtLink>
            <span v-else>{{ name }}</span>
          </li>
        </ul>
        <p v-else class="text-sm text-muted">{{ componentNames.length ? 'No matching components.' : 'No components registered by this package in this App.' }}</p>
      </section>
    </template>
    <UPageGrid v-else>
      <UPageCard v-for="entry in packages" :key="entry.name" :title="entry.name" :description="entry.description" :to="`/packages/${entry.name}`" icon="i-lucide-package" />
    </UPageGrid>
  </UContainer>
</template>
<script setup lang="ts">
import packageComponents from '#build/fireux-package-components'
const props = withDefaults(defineProps<{
  appName: string
  packages: { name: string; description?: string }[]
  selected?: string
  componentLinks?: Record<string, string>
  examples: { title: string; description: string; to: string }[]
}>(), { componentLinks: () => ({}) })
const search = ref('')
const componentNames = computed<string[]>(() => packageComponents[props.selected || ''] || [])
const filteredComponents = computed(() => componentNames.value.filter((name) => name.toLowerCase().includes(search.value.toLowerCase())))
watch(() => props.selected, () => { search.value = '' })
</script>
