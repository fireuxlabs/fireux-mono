<template>
  <UContainer>
    <UPageSection>
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
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-3">
                <UIcon
                  v-if="item.icon"
                  :name="item.icon"
                  class="text-primary text-lg"
                />
                <h3 class="font-semibold">{{ item.title }}</h3>
                <UBadge v-if="item.badge" variant="soft" color="primary">
                  {{ item.badge }}
                </UBadge>
              </div>
              <UIcon name="i-heroicons-arrow-right" class="text-primary" />
            </div>
          </template>

          <p>
            {{ item.description }}
          </p>

        </UCard>
      </div>
    </UPageSection>
  </UContainer>
</template>

<script setup lang="ts">
export interface LandingSolutionItem {
  title: string
  description: string
  to: string
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
