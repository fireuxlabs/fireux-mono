<template>
  <section class="space-y-6 py-12">
    <LandingMissingBrandAssetsFlag />
    <LandingTenantPlaceholderFlag />

    <header>
      <h1 class="text-3xl font-semibold">Join This Tenant</h1>
      <p class="mt-2 text-gray-600">
        Complete onboarding, then use the admin tools to grant yourself access
        or request membership from an existing admin.
      </p>
    </header>

    <div class="space-y-4">
      <p>
        If you just initialized the app, run <code>ensureApp()</code> from the
        runtime controls or use the onboarding modal to create admin membership.
      </p>
      <p>
        Already a member? Navigate back to the console once the runtime user
        resolves.
      </p>
    </div>
  </section>
</template>

<script setup lang="ts">
useSeoMeta({
  title: 'Join Tenant',
  description: 'Instructions for joining the tenant runtime.',
})
</script>
