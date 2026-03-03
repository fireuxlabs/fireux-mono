<template>
  <UPage>
    <UPageHeader
      title="Projects"
      description="Workspace for app builders and operators."
    />

    <UPageBody class="pagebody">
      <UCard class="space-y-3">
        <p class="text-sm text-gray-600 dark:text-gray-300">
          Projects are the human-facing grouping for work you do in FireUX. They
          typically connect apps, environments, and the people operating them.
        </p>

        <div class="space-y-2 text-sm text-gray-600 dark:text-gray-300">
          <p>This is a stub route so navigation stays honest.</p>
          <p>
            Next: wire this page to the registry and show the current user's
            projects (or the apps they can manage).
          </p>
        </div>
      </UCard>
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
definePageMeta({
  title: 'Projects',
  tag: 'apps',
})

useSeoMeta({
  title: 'Projects · FireUX',
  description: 'Project workspace for builders and operators.',
})
</script>
