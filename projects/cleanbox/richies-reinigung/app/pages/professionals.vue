<template>
  <UContainer class="professionals-page">
    <header class="page-header">
      <h1>Cleaning Professionals</h1>
      <p>
        Explore the team, view upcoming availability, and invite new cleaners to
        join Richies Reinigung.
      </p>
    </header>

    <section class="cta-grid">
      <UCard>
        <template #header>Team Directory</template>
        <p class="card-copy">
          Review profiles, update specialties, and manage contact details for
          your cleaning crew.
        </p>
        <UButton color="primary" variant="solid" block disabled>
          View Team (coming soon)
        </UButton>
      </UCard>

      <UCard id="services">
        <template #header>Service Catalog</template>
        <p class="card-copy">
          Maintain the list of services on offer, including pricing and duration
          so booking flows stay accurate.
        </p>
        <UButton color="primary" variant="outline" block disabled>
          Manage Services (coming soon)
        </UButton>
      </UCard>
    </section>
  </UContainer>
</template>

<script setup>
useSeoMeta({
  title: 'Richies Reinigung – Cleaning Professionals',
  description:
    'Overview of cleaning professionals and service catalog for Richies Reinigung.',
})

definePageMeta({
  layout: 'default',
  nav: {
    key: 'professionals',
    label: 'Professionals',
    icon: 'i-lucide-users',
    desktop: true,
    mobile: true,
    layouts: ['default'],
  },
})
</script>

<style scoped>
.professionals-page {
  display: flex;
  flex-direction: column;
  gap: var(--space-8);
  padding: var(--space-10) 0;
}

.page-header {
  max-width: 640px;
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.page-header h1 {
  font-size: var(--text-4xl);
  font-weight: var(--font-weight-extrabold);
  color: var(--color-primary-700);
}

.page-header p {
  color: var(--color-gray-600);
  line-height: 1.6;
}

.cta-grid {
  display: grid;
  gap: var(--space-6);
}

@media (min-width: 768px) {
  .cta-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

.card-copy {
  color: var(--color-gray-600);
  line-height: 1.6;
  margin-bottom: var(--space-4);
}
</style>
