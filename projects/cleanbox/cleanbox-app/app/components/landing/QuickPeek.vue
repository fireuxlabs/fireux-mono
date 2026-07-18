<template>
  <UCard>
    <template #header>
      <div class="flex items-start justify-between gap-4">
        <div class="space-y-1">
          <h2 class="text-2xl font-semibold">{{ title }}</h2>
          <p v-if="subtitle" class="text-sm text-muted">
            {{ subtitle }}
          </p>
        </div>
        <UButton v-if="cta" variant="outline" :icon="cta.icon" :to="cta.to">
          {{ cta.label }}
        </UButton>
      </div>
    </template>

    <ul class="space-y-4">
      <li class="flex gap-3" v-for="item in items" :key="item.title">
        <div
          class="grid place-items-center rounded-lg w-10 h-10 bg-primary/15 text-primary"
        >
          <UIcon :name="item.icon" />
        </div>
        <div class="space-y-1">
          <div>
            <h3 class="font-medium">{{ item.title }}</h3>
            <p
              v-if="item.subtitle"
              class="text-sm text-muted"
            >
              {{ item.subtitle }}
            </p>
          </div>
          <p class="text-sm text-muted">
            {{ item.description }}
          </p>
        </div>
      </li>
    </ul>

    <template #footer>
      <div
        v-if="footer"
        class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div class="space-y-1">
          <p class="font-medium">{{ footer.title }}</p>
          <p class="text-sm text-muted">
            {{ footer.subtitle }}
          </p>
        </div>
        <UButton
          v-if="footer.cta"
          variant="outline"
          :icon="footer.cta.icon"
          :to="footer.cta.to"
        >
          {{ footer.cta.label }}
        </UButton>
      </div>
      <UBadge v-else-if="footerBadge" variant="soft" color="primary">
        {{ footerBadge }}
      </UBadge>
    </template>
  </UCard>
</template>

<script setup lang="ts">
export interface QuickPeekItem {
  icon: string
  title: string
  description: string
  subtitle?: string
}

export interface QuickPeekCta {
  label: string
  to: string
  icon?: string
}

export interface QuickPeekFooter {
  title: string
  subtitle: string
  cta?: QuickPeekCta
}

export interface QuickPeekProps {
  title: string
  subtitle?: string
  cta?: QuickPeekCta
  items: QuickPeekItem[]
  footer?: QuickPeekFooter
  footerBadge?: string
}

defineProps<QuickPeekProps>()
</script>
