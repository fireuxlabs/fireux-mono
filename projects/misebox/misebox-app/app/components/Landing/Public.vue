<template>
  <UContainer class="customer-home">
    <section class="space-y-6" aria-labelledby="home-kitchens-title">
      <h1
        id="home-kitchens-title"
        class="text-2xl font-semibold tracking-tight"
      >
        Kitchens
      </h1>
      <div v-if="pending" role="status" class="text-muted">
        Loading Kitchens…
      </div>
      <UAlert
        v-else-if="error"
        title="Kitchens could not be loaded"
        color="neutral"
        variant="soft"
        :actions="[{ label: 'Try again', onClick: () => refresh() }]"
      />
      <KitchenCollection v-else-if="kitchens.length" :kitchens="kitchens" />
      <UAlert
        v-else
        title="No Kitchens available yet"
        color="neutral"
        variant="soft"
      />
    </section>

    <UPageCTA
      as="section"
      title="Kitchen Workspace"
      description="Manage your Kitchen, Menus and Team."
      orientation="horizontal"
      variant="solid"
      class="mt-16 overflow-hidden bg-primary text-inverted ring-0"
      :ui="{
        container: 'py-12 sm:py-16 lg:py-20',
        title:
          'text-inverted text-4xl sm:text-5xl font-semibold tracking-tight',
        description: 'text-inverted/75',
        links: 'justify-start',
      }"
    >
      <template #links>
        <UButton
          to="/workspace/kitchen"
          color="neutral"
          variant="solid"
          size="xl"
          trailing-icon="i-lucide-arrow-up-right"
          label="Open Workspace"
          class="rounded-full px-6"
        />
      </template>
      <div
        class="hidden lg:flex items-center justify-center"
        aria-hidden="true"
      >
        <UIcon
          name="i-lucide-chef-hat"
          class="size-48 text-inverted/20 -rotate-12"
        />
      </div>
    </UPageCTA>
  </UContainer>
</template>

<script setup lang="ts">
import { useKitchenCollection } from 'fireux-kitchens/runtime/kitchen/composables/useKitchenCollection'

const { collection: kitchens, pending, error, refresh } = useKitchenCollection()
</script>

<style scoped>
.customer-home {
  padding-block: clamp(
    calc(var(--spacing) * 12),
    7vw,
    calc(var(--spacing) * 24)
  );
}
</style>
