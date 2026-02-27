<template>
  <UPage>
    <UPageHeader
      title="Granite"
      description="Rock Solid OS for portfolio landlords."
      class="border-b-0"
    />

    <UPageBody class="pagebody space-y-6">
      <UCard>
        <div class="space-y-3">
          <p class="text-sm text-dimmed">
            Granite console is portfolio-runtime based. Start by selecting a portfolio context.
          </p>

          <div class="flex flex-wrap gap-2">
            <UButton to="/portfolios" icon="i-lucide-building">Select portfolio</UButton>
            <UButton to="/console/portfolio" variant="soft" icon="i-lucide-terminal">
              Open console
            </UButton>
          </div>
        </div>
      </UCard>
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'default',
  nav: {
    key: 'home',
    label: 'Home',
    icon: 'i-lucide-home',
    desktop: true,
    mobile: true,
    layouts: ['default'],
  },
})

useSeoMeta({
  title: 'Granite | Portfolio landlord OS',
  description:
    'Granite provides one control surface for properties, compliance, documents, tasks, and operations.',
})
</script>
