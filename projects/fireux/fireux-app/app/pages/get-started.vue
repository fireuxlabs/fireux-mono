<template>
  <UPage>
    <UPageHeader
      title="Get started"
      description="High-level orientation and next actions."
    />

    <UPageBody class="pagebody">
      <UCard class="space-y-3">
        <p class="text-sm text-gray-600 dark:text-gray-300">
          FireUX is an app + ecosystem system. This page is the human entry
          point: what the platform is, what you can do next, and where to click.
        </p>

        <div class="space-y-2 text-sm">
          <p class="text-gray-900 dark:text-gray-100">Start here:</p>
          <ul class="list-disc space-y-1 pl-5 text-gray-600 dark:text-gray-300">
            <li>
              Browse ecosystems:
              <NuxtLink class="text-primary-500 hover:underline" to="/ecosystems">
                /ecosystems
              </NuxtLink>
            </li>
            <li>
              Create apps:
              <NuxtLink class="text-primary-500 hover:underline" to="/apps">
                /apps
              </NuxtLink>
            </li>
            <li>
              Developer utilities:
              <NuxtLink class="text-primary-500 hover:underline" to="/dev">
                /dev
              </NuxtLink>
            </li>
            <li>
              Deeper onboarding notes:
              <NuxtLink
                class="text-primary-500 hover:underline"
                to="/getting-started"
              >
                /getting-started
              </NuxtLink>
            </li>
          </ul>
        </div>
      </UCard>
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
definePageMeta({
  title: 'Get started',
})

useSeoMeta({
  title: 'Get started · FireUX',
  description: 'Orientation and next steps for FireUX.',
})
</script>
