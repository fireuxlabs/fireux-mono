<template>
  <div class="space-y-4">
    <p
      v-if="!sections.length"
      class="text-sm text-dimmed"
    >
      {{ emptyLabel }}
    </p>

    <section
      v-for="section in sections"
      v-else
      :key="section.label"
      class="space-y-2"
    >
      <h4 class="text-xs font-semibold uppercase tracking-wide text-dimmed">
        {{ section.label || 'Untitled section' }}
      </h4>

      <div class="space-y-2">
        <article
          v-for="item in section.items"
          :key="`${section.label}-${item.name}`"
          class="rounded-lg border border-default p-3"
        >
          <div class="flex items-start justify-between gap-3">
            <div class="min-w-0 space-y-1">
              <p class="text-sm font-medium text-highlighted">
                {{ item.name || 'Untitled item' }}
              </p>
              <p
                v-if="item.description"
                class="text-xs text-dimmed"
              >
                {{ item.description }}
              </p>
            </div>
            <p
              v-if="item.price"
              class="shrink-0 text-sm font-semibold text-highlighted"
            >
              {{ item.price }}
            </p>
          </div>
        </article>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  sections: {
    label: string
    items: {
      name: string
      description: string
      price: string
    }[]
  }[]
  emptyLabel: string
}>()
</script>
