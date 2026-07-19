<template>
  <UPage>
    <UPageHeader
      title="FireUX Jobs"
      description="How the unified jobs workspace helps agents and professionals connect."
    />

    <UPageBody class="pagebody">
      <section class="space-y-3">
        <h2 class="text-lg font-semibold">Why FireUX Jobs exists</h2>
        <p class="text-sm text-toned">
          FireUX Jobs centralises hiring across every tenant so teams can draft
          roles once, share globally, and augment them with tenant-specific
          context. Professionals reuse their profiles across Misebox, Cleanbox,
          and future tenants.
        </p>
      </section>

      <section class="space-y-3">
        <h3 class="text-base font-semibold">Core capabilities today</h3>
        <ul class="space-y-2 text-sm text-toned">
          <li>
            <strong class="font-medium text-highlighted"
              >Global job collection</strong
            >
            &nbsp;— all jobs live in a single Firestore collection keyed by the
            Firestore auto ID. Tenant filters keep listings scoped when needed.
          </li>
          <li>
            <strong class="font-medium text-highlighted"
              >Agent-authored drafts</strong
            >
            &nbsp;— agents can create jobs once they establish their profile.
            Drafts stay private until marked open.
          </li>
          <li>
            <strong class="font-medium text-highlighted">Realtime editing</strong>
            &nbsp;— title, description, pay, and status updates sync instantly
            across tenants.
          </li>
        </ul>
      </section>

      <section class="space-y-3">
        <h3 class="text-base font-semibold">Coming next</h3>
        <ul class="space-y-2 text-sm text-toned">
          <li>Candidate applications and shortlist management.</li>
          <li>Tenant-branded onboarding flows and job templates.</li>
          <li>Automated notifications for updates, interviews, and offers.</li>
        </ul>
      </section>

      <section class="space-y-3">
        <h3 class="text-base font-semibold">Get involved</h3>
        <p class="text-sm text-toned">
          Agents can start by creating a draft job from the Jobs console.
          Professionals should keep their profiles complete so they appear in
          recommendations when jobs go live.
        </p>
        <div class="flex flex-wrap gap-2">
          <UButton to="/jobs/create" color="primary">Create a job</UButton>
          <UButton to="/profiles" variant="ghost">Review your profile</UButton>
        </div>
      </section>
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
import { useHead } from 'nuxt/app'
definePageMeta({
  layout: 'default',
})

useHead({ title: 'Learn more about FireUX Jobs' })
</script>
