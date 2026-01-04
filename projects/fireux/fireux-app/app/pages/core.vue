<template>
  <UPage>
    <UPageHeader
      title="Core"
      description="The platform layer that ecosystems and apps run on."
    />

    <UPageBody class="pagebody">
      <UCard class="space-y-3">
        <p class="text-sm text-gray-600 dark:text-gray-300">
          FireUX Core is the shared substrate: identity, roles, registry,
          conventions, and the runtime pieces that keep apps interoperable.
        </p>

        <div class="space-y-2 text-sm text-gray-600 dark:text-gray-300">
          <p>This is intentionally a stub route for now.</p>
          <p>
            Next: link to the dev registry tools and any core docs you want to
            expose publicly.
          </p>
        </div>
      </UCard>
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
definePageMeta({
  title: 'Core',
})

useSeoMeta({
  title: 'Core · FireUX',
  description: 'The FireUX platform layer.',
})
</script>
