<template>
  <UPage>
    <UPageHeader
      class="pageheader"
      title="Ecosystem Setup Guide"
      description="How to create a new FireUX ecosystem and wire Firebase correctly."
    />

    <UPageBody class="pagebody space-y-6">
      <UAlert
        color="primary"
        variant="soft"
        title="Moved from /ecosystems"
        description="The setup guide now lives at /ecosystems/learn-more. /ecosystems is the live ecosystem directory."
      />

      <div class="flex flex-wrap gap-2">
        <UButton to="/ecosystems" color="primary" icon="i-lucide-orbit">
          Open ecosystems
        </UButton>
        <UButton to="/ecosystems/learn-more/dev" color="neutral" variant="soft" icon="i-lucide-code-2">
          Dev details
        </UButton>
      </div>

      <UCard>
        <template #header>
          <h2 class="text-lg font-semibold">Docs hierarchy</h2>
        </template>

        <ul class="list-disc space-y-2 pl-5 text-sm">
          <li><strong>/ecosystems</strong>: browse active ecosystems.</li>
          <li><strong>/ecosystems/learn-more</strong>: create a new ecosystem and wire Firebase.</li>
          <li><strong>/apps</strong>: create global or tenant apps under an ecosystem.</li>
        </ul>
      </UCard>

      <UCard>
        <template #header>
          <h2 class="text-lg font-semibold">1. Create Firebase project</h2>
        </template>

        <ol class="list-decimal space-y-2 pl-5 text-sm">
          <li>Create a new Firebase project and switch billing from Spark to Blaze.</li>
          <li>Enable Authentication, Firestore, and Storage.</li>
          <li>Create a Web app and save the Firebase web config values.</li>
          <li>Create a service account key for local admin/server tasks.</li>
        </ol>
      </UCard>

      <UCard>
        <template #header>
          <h2 class="text-lg font-semibold">2. Scaffold ecosystem package</h2>
        </template>

        <p class="text-sm text-dimmed">
          Use the repo-local scaffolder to generate package structure and baseline config.
        </p>

        <pre class="mt-3 overflow-x-auto rounded border border-default bg-default p-3 text-xs"><code>pnpm create:ecosystem -- --name &lt;name&gt; --firebase-project &lt;firebase-project-id&gt;</code></pre>
      </UCard>

      <UCard>
        <template #header>
          <h2 class="text-lg font-semibold">3. Place Firebase values correctly</h2>
        </template>

        <ul class="list-disc space-y-2 pl-5 text-sm">
          <li>Put core Firebase fields in <code>ecosystem.config.ts</code>.</li>
          <li>Put <code>NUXT_FIREBASE_APP_ID</code> in the app <code>.env</code>.</li>
          <li>Put optional <code>NUXT_FIREBASE_MEASUREMENT_ID</code> in the app <code>.env</code>.</li>
          <li>Store service account JSON under the ecosystem config folder.</li>
          <li>Set project binding in ecosystem <code>.firebaserc</code>.</li>
        </ul>
      </UCard>

      <UCard>
        <template #header>
          <h2 class="text-lg font-semibold">4. Create global app</h2>
        </template>

        <p class="text-sm text-dimmed">
          Continue to <NuxtLink to="/apps" class="text-primary hover:underline">/apps</NuxtLink> for full app scaffolding, env setup, and deploy wiring.
        </p>
      </UCard>

      <UCard>
        <template #header>
          <h2 class="text-lg font-semibold">5. Validate</h2>
        </template>

        <pre class="overflow-x-auto rounded border border-default bg-default p-3 text-xs"><code>pnpm guard
pnpm typecheck:packages
pnpm typecheck:apps</code></pre>
      </UCard>
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
definePageMeta({
  tag: 'ecosystems',
  layout: 'default',
  name: 'EcosystemsLearnMorePage',
})

useSeoMeta({
  title: 'Ecosystem Setup Guide · FireUX',
  description:
    'Step-by-step setup guide for creating a FireUX ecosystem and wiring Firebase correctly.',
})
</script>
