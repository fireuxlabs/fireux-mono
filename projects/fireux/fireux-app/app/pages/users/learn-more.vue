<template>
  <UPage>
    <UPageHeader
      class="pageheader"
      title="Users: Learn More"
      description="How public FireUX user profiles work across identity, handles, and account surfaces."
    />

    <UPageBody class="pagebody space-y-6">
      <UCard>
        <template #header>
          <h2 class="text-lg font-semibold">What a user means in FireUX</h2>
        </template>

        <ul class="list-disc fx-list-stack text-sm">
          <li>A user is the core identity record that moves across FireUX apps and ecosystems.</li>
          <li>Public profiles are discovered through handles, not internal ids.</li>
          <li>Private operational access is handled separately from the public profile surface.</li>
        </ul>
      </UCard>

      <UCard>
        <template #header>
          <h2 class="text-lg font-semibold">Public profile flow</h2>
        </template>

        <ol class="list-decimal fx-list-stack text-sm">
          <li>Create or sign in to a FireUX account.</li>
          <li>Publish a handle and profile details that are safe for public discovery.</li>
          <li>Use the dashboard for account surfaces and the public users index for discovery.</li>
        </ol>
      </UCard>

      <div class="flex flex-wrap gap-2">
        <UButton to="/users" color="primary" icon="i-lucide-users">
          Open users
        </UButton>
        <UButton to="/users/learn-more/dev" color="neutral" variant="soft" icon="i-lucide-code-2">
          Dev details
        </UButton>
        <UButton to="/auth" color="neutral" variant="soft" icon="i-lucide-log-in">
          Auth
        </UButton>
        <UButton to="/dashboard" color="neutral" variant="ghost" icon="i-lucide-layout-dashboard">
          Dashboard
        </UButton>
      </div>
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'default',
  name: 'UsersLearnMorePage',
})

useSeoMeta({
  title: 'Users: Learn More · FireUX',
  description: 'How FireUX user identities, handles, and public profiles are structured.',
})
</script>
