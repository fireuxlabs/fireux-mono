<template>
  <UPage>
    <UPageHeader
      class="pageheader"
      title="Users: Learn More (Dev)"
      description="Technical reference for FireUX User routes, handles, and endpoint surfaces."
    />

    <UPageBody class="pagebody space-y-6">
      <UCard>
        <template #header>
          <h2 class="text-lg font-semibold">Canonical records</h2>
        </template>

        <ul class="list-disc fx-list-stack text-sm">
          <li>Core identity collection: <code>users</code>.</li>
          <li>Profile route contract: <code>/users/[handle]</code>.</li>
          <li>
            Workspace/admin routes remain id-based; directory discovery stays
            handle-based.
          </li>
        </ul>
      </UCard>

      <UCard>
        <template #header>
          <h2 class="text-lg font-semibold">Primary endpoints</h2>
        </template>

        <div class="space-y-2 text-sm">
          <div class="fx-inset-panel">
            <p class="font-mono">GET /api/users</p>
            <p class="text-dimmed">
              Returns User rows for the Users index surface.
            </p>
          </div>
          <div class="fx-inset-panel">
            <p class="font-mono">/users/[handle]</p>
            <p class="text-dimmed">
              Canonical profile route resolved from the stored User handle.
            </p>
          </div>
        </div>
      </UCard>

      <div class="flex flex-wrap gap-2">
        <UButton to="/users" color="primary" icon="i-lucide-users"
          >Open users</UButton
        >
        <UButton
          to="/users/learn-more"
          color="neutral"
          variant="soft"
          icon="i-lucide-book-open"
          >Public guide</UButton
        >
      </div>
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'default',
  name: 'UsersLearnMoreDevPage',
})

useSeoMeta({
  title: 'Users: Learn More (Dev) · FireUX',
  description:
    'Technical reference for FireUX User handles, endpoints, and route surfaces.',
})
</script>
