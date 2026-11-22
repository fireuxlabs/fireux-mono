<template>
  <UContainer>
    <UBreadcrumb
      :items="[
        { label: appName, to: '/' },
        { label: 'Packages', to: '/packages' },
        ...(selected ? [{ label: selected }] : []),
      ]"
    />
    <UPageHeader
      :title="selected || 'Package library'"
      :description="
        selected
          ? packages.find((entry) => entry.name === selected)?.description
          : 'Packages used by this App.'
      "
    />
    <template v-if="selected">
      <UPageGrid v-if="examples.length">
        <UPageCard
          v-for="example in examples"
          :key="example.to"
          :title="example.title"
          :description="example.description"
          :to="example.to"
          icon="i-lucide-blocks"
        />
      </UPageGrid>
    </template>
    <UPageGrid v-else>
      <UPageCard
        v-for="entry in packages"
        :key="entry.name"
        :title="entry.name"
        :description="entry.description"
        :to="`/packages/${entry.name}`"
        icon="i-lucide-package"
      />
    </UPageGrid>
  </UContainer>
</template>
<script setup lang="ts">
defineProps<{
  appName: string
  packages: { name: string; description?: string }[]
  selected?: string
  examples: { title: string; description: string; to: string }[]
}>()
</script>
