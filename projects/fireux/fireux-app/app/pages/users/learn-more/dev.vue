<template>
  <UPage>
    <UPageHeader
      class="pageheader"
      title="Users: Learn More (Dev)"
      description="Technical reference for FireUX User routes, handles, and endpoint surfaces."
    />

    <UPageBody class="pagebody">
      <UCard>
        <template #header>
          <h2 class="fx-type-section-title">Canonical records</h2>
        </template>

        <ul class="fx-list-stack">
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
          <h2 class="fx-type-section-title">Primary endpoints</h2>
        </template>

        <div class="pagebody">
          <div class="fx-inset-panel">
            <p class="fx-type-code">GET /api/users</p>
            <p class="fx-type-body">
              Returns User rows for the Users index surface.
            </p>
          </div>
          <div class="fx-inset-panel">
            <p class="fx-type-code">/users/[handle]</p>
            <p class="fx-type-body">
              Canonical profile route resolved from the stored User handle.
            </p>
          </div>
        </div>
      </UCard>

      <div class="fx-card__actions">
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
