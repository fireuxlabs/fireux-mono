<template>
  <UPage>
    <UPageHeader
      title="Cleanbox Jobs"
      description="How Cleanbox leverages FireUX Jobs to streamline cleaning engagements."
    />

    <UPageBody class="space-y-8">
      <section class="space-y-3">
        <h2 class="text-lg font-semibold">Why Cleanbox uses FireUX Jobs</h2>
        <p class="text-sm text-gray-600">
          The shared jobs layer lets Cleanbox teams source vetted cleaners rapidly while preserving tenant-specific branding and workflows.
        </p>
      </section>

      <section class="space-y-3">
        <h3 class="text-base font-semibold">Capabilities available now</h3>
        <ul class="space-y-2 text-sm text-gray-600">
          <li>Create and manage drafting, open, and closed job states.</li>
          <li>Capture pay information and notes that sync across tenants.</li>
          <li>Update content any time to keep crews informed before a shift.</li>
        </ul>
      </section>

      <section class="space-y-3">
        <h3 class="text-base font-semibold">Upcoming improvements</h3>
        <ul class="space-y-2 text-sm text-gray-600">
          <li>Cleaner availability matching and preferred crew assignments.</li>
          <li>Checklists tailored to building size and cleaning type.</li>
          <li>Automated notifications for confirmations and follow-ups.</li>
        </ul>
      </section>

      <section class="space-y-3">
        <h3 class="text-base font-semibold">Next steps</h3>
        <p class="text-sm text-gray-600">
          Set up your Cleanbox employer profile, publish a draft, and keep clients updated with live status changes.
        </p>
        <div class="flex flex-wrap gap-2">
          <UButton to="/jobs/create" color="primary">Create a Cleanbox job</UButton>
          <UButton to="/profiles" variant="ghost">Review team profiles</UButton>
        </div>
      </section>
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'default',
})

useHead({ title: 'Learn more about Cleanbox Jobs' })
</script>
