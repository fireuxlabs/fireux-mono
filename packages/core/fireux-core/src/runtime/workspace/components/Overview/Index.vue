<template>
  <div class="space-y-6">
    <UCard>
      <div
        class="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between"
      >
        <div class="flex min-w-0 items-center gap-4">
          <UAvatar
            :src="image || undefined"
            :alt="title"
            :ui="
              imageFit === 'contain'
                ? { image: 'object-contain p-1.5' }
                : undefined
            "
            :icon="icon"
            size="3xl"
          />
          <div class="min-w-0">
            <p v-if="label" class="text-sm text-muted">{{ label }}</p>
            <h1 class="text-2xl font-semibold text-highlighted">{{ title }}</h1>
            <p v-if="description" class="mt-2 max-w-2xl text-sm text-toned">
              {{ description }}
            </p>
          </div>
        </div>
        <slot name="badge" />
      </div>
      <template #footer>
        <nav class="flex flex-wrap gap-2" aria-label="Workspace capabilities">
          <UButton
            v-for="link in links"
            :key="link.to"
            v-bind="link"
            color="neutral"
            variant="ghost"
          />
        </nav>
      </template>
    </UCard>
    <div
      class="grid items-start gap-6"
      :class="$slots.attention ? 'lg:grid-cols-3' : ''"
    >
      <div
        class="min-w-0 space-y-6"
        :class="$slots.attention ? 'lg:col-span-2' : ''"
      >
        <slot />
      </div>
      <UCard v-if="$slots.attention">
        <template #header
          ><h2 class="font-semibold">Needs attention</h2></template
        >
        <div class="space-y-3"><slot name="attention" /></div>
      </UCard>
    </div>
  </div>
</template>
<script setup lang="ts">
defineProps<{
  title: string
  label?: string
  description?: string
  image?: string
  imageFit?: 'contain' | 'cover'
  icon?: string
  links: { label: string; to: string; icon?: string }[]
}>()
</script>
