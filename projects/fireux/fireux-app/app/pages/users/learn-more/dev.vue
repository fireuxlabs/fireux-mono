<template>
  <UPage>
    <UPageHeader
      class="pageheader"
      title="Users: Learn More (Dev)"
      description="Technical reference for FireUX public-user routes, handles, and endpoint surfaces."
    />

    <UPageBody class="pagebody space-y-6">
      <UCard>
        <template #header>
          <h2 class="text-lg font-semibold">Canonical records</h2>
        </template>

        <ul class="list-disc space-y-2 pl-5 text-sm">
          <li>Core identity collection: <code>users</code>.</li>
          <li>Public route contract: <code>/users/[handle]</code>.</li>
          <li>Console/admin routes remain id-based; public discovery stays handle-based.</li>
        </ul>
      </UCard>

      <UCard>
        <template #header>
          <h2 class="text-lg font-semibold">Primary endpoints</h2>
        </template>

        <div class="space-y-2 text-sm">
          <div class="rounded border border-default p-3">
            <p class="font-mono">GET /api/public/users</p>
            <p class="text-dimmed">Returns public user rows for the users index surface.</p>
          </div>
          <div class="rounded border border-default p-3">
            <p class="font-mono">/users/[handle]</p>
            <p class="text-dimmed">Canonical public profile route resolved from the stored user handle.</p>
          </div>
        </div>
      </UCard>

      <div class="flex flex-wrap gap-2">
        <UButton to="/users" color="primary" icon="i-lucide-users">Open users</UButton>
        <UButton to="/users/learn-more" color="neutral" variant="soft" icon="i-lucide-book-open">Public guide</UButton>
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
  description: 'Technical reference for FireUX user handles, public user endpoints, and route surfaces.',
})
</script>
