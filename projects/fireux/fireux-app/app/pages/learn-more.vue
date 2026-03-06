<template>
  <UPage>
    <UPageHeader
      class="pageheader"
      title="Learn More"
      description="FireUX guides for ecosystems, apps, modules, and platform operations."
    />

    <UPageBody class="pagebody space-y-6">
      <UCard>
        <template #header>
          <h2 class="text-lg font-semibold">Start here</h2>
        </template>

        <p class="text-sm text-dimmed">
          Use these pages in order to understand what FireUX is, what it can do now, and how to launch.
        </p>

        <div class="mt-4 flex flex-wrap gap-2">
          <UButton to="/about" color="neutral" variant="soft" icon="i-lucide-info">
            About
          </UButton>
          <UButton to="/get-started" color="neutral" variant="soft" icon="i-lucide-rocket">
            Get started
          </UButton>
          <UButton to="/pricing" color="neutral" variant="soft" icon="i-lucide-badge-dollar-sign">
            Pricing
          </UButton>
          <UButton to="/learn-more/dev" color="neutral" variant="soft" icon="i-lucide-code-2">
            Dev
          </UButton>
        </div>
      </UCard>

      <UCard>
        <template #header>
          <h2 class="text-lg font-semibold">Entity learn-more pages</h2>
        </template>

        <div class="flex flex-wrap gap-2">
          <UButton to="/ecosystems/learn-more" color="primary" variant="soft" icon="i-lucide-orbit">
            Ecosystems
          </UButton>
          <UButton to="/apps/learn-more" color="primary" variant="soft" icon="i-lucide-app-window">
            Apps
          </UButton>
          <UButton to="/modules/learn-more" color="primary" variant="soft" icon="i-lucide-puzzle">
            Modules
          </UButton>
        </div>
      </UCard>

      <UAlert
        color="neutral"
        variant="soft"
        title="SEO static route pattern"
        description="This route is the canonical entry for learn-more content in FireUX. Ecosystem apps follow the same /learn-more pattern."
      />
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'default',
  name: 'FireuxLearnMorePage',
})

useSeoMeta({
  title: 'Learn More · FireUX',
  description: 'Guides for FireUX ecosystems, apps, modules, and platform operations.',
})
</script>
