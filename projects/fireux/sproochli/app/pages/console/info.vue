<template>
  <UPage>
    <UPageHeader
      title="Info Pages"
      description="Places, multilingual public pages, and publishing status for Sproochli."
    />

    <UPageBody>
      <section class="console-grid">
        <UCard v-for="item in items" :key="item.title">
          <div class="console-card-content">
            <Icon :name="item.icon" />
            <div>
              <p class="console-card-title">{{ item.title }}</p>
              <p class="console-card-copy">{{ item.copy }}</p>
            </div>
          </div>
        </UCard>
      </section>

      <UCard>
        <div class="console-placeholder">
          <UBadge color="neutral" variant="soft">Editor coming soon</UBadge>
          <h2>Draft / Published</h2>
          <p>
            The first editor will manage generic info pages for places without
            coupling Sproochli to kitchens, menus, chefs, suppliers, or Misebox models.
          </p>
          <UButton to="/info/bern-bike-rental/rental-instructions" icon="i-lucide-eye" variant="soft">
            Preview sample page
          </UButton>
        </div>
      </UCard>
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'default',
  requiresAuth: true,
  nav: {
    key: 'console-info',
    label: 'Info Pages',
    icon: 'i-lucide-languages',
    desktop: true,
    mobile: true,
  },
})

useSeoMeta({
  title: 'Info Pages · Sproochli',
  robots: 'noindex, nofollow',
})

const items = [
  {
    title: 'Info Pages',
    copy: 'QR-friendly public pages with original, certified, and cached language output.',
    icon: 'i-lucide-file-text',
  },
  {
    title: 'Places',
    copy: 'The real-world businesses and places that own published visitor information.',
    icon: 'i-lucide-map-pin',
  },
  {
    title: 'Draft / Published',
    copy: 'A simple editorial state before adding workflow, analytics, or automation.',
    icon: 'i-lucide-list-checks',
  },
]
</script>

<style scoped>
.console-grid {
  display: grid;
  gap: 1rem;
}

.console-card-content {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 0.85rem;
}

.console-card-content :deep(svg) {
  width: 1.4rem;
  height: 1.4rem;
  color: var(--ui-primary);
}

.console-card-title {
  margin: 0;
  font-size: 1rem;
  font-weight: 800;
}

.console-card-copy {
  margin: 0.25rem 0 0;
  color: var(--ui-text-muted);
  line-height: 1.6;
}

.console-placeholder {
  max-width: 680px;
}

.console-placeholder h2 {
  margin: 1rem 0 0.5rem;
  font-size: 1.5rem;
}

.console-placeholder p {
  margin: 0 0 1rem;
  color: var(--ui-text-muted);
  line-height: 1.7;
}

@media (min-width: 800px) {
  .console-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}
</style>
