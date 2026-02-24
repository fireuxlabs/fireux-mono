<template>
  <UPageSection class="py-12 lg:py-16 space-y-10">
    <div class="mx-auto max-w-2xl space-y-3 text-center">
      <h2 class="text-3xl font-black">{{ title }}</h2>
      <p
        v-if="subtitle"
        class="text-base text-[color:var(--ui-text-muted)] lg:text-lg"
      >
        {{ subtitle }}
      </p>
    </div>

    <div class="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
      <UCard
        v-for="item in items"
        :key="item.title"
        :to="item.to"
        class="h-full"
      >
        <template #header>
          <div class="flex items-start gap-3">
            <div
              v-if="item.icon"
              class="grid h-10 w-10 place-items-center rounded-full bg-primary/10 text-primary"
            >
              <UIcon :name="item.icon" />
            </div>
            <div class="space-y-1">
              <UBadge v-if="item.badge" variant="soft" color="primary">
                {{ item.badge }}
              </UBadge>
              <h3 class="text-lg font-semibold">{{ item.title }}</h3>
            </div>
          </div>
        </template>

        <p class="text-sm text-[color:var(--ui-text-muted)]">
          {{ item.description }}
        </p>

        <template #footer>
          <UButton
            variant="ghost"
            size="sm"
            trailing-icon="i-heroicons-arrow-right"
          >
            {{ item.cta ?? 'Learn more' }}
          </UButton>
        </template>
      </UCard>
    </div>
  </UPageSection>
</template>

<script setup lang="ts">
export interface LandingSolutionItem {
  title: string
  description: string
  to: string
  cta?: string
  icon?: string
  badge?: string
}

export interface LandingSolutionsProps {
  title: string
  subtitle?: string
  items: LandingSolutionItem[]
}

defineProps<LandingSolutionsProps>()
</script>
