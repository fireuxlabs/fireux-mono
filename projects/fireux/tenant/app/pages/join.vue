<!-- Concurrent edit — 2026-07-20 23:34 CEST — Final app CSS pass: semantic colors. -->
<template>
  <section class="space-y-6 py-12">
    <FireLandingMissingBrandAssetsFlag />

    <header>
      <h1 class="text-3xl font-semibold">Join This Tenant</h1>
      <p class="mt-2 text-toned">
        Complete onboarding, then use the admin tools to grant yourself access
        or request membership from an existing admin.
      </p>
    </header>

    <div class="space-y-4">
      <p>
        Use App setup to initialize this App and its first administrator membership.
      </p>
      <p>
        Already a member? Navigate back to the workspace once the runtime user
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
