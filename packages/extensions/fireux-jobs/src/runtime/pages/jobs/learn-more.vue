<!-- Concurrent edit — 2026-07-23 15:48 CEST — Keep the shared Jobs guide truthful about browse, profile, and employer capabilities. -->
<template>
  <UPage>
    <UPageHeader
      title="About Jobs"
      description="Browse published opportunities, prepare a professional profile, or publish a role as an employer."
    />

    <UPageBody class="pagebody">
      <section class="space-y-3">
        <h2 class="fx-type-section-title">What you can do today</h2>
        <p>
          Explore open public roles connected to canonical employers and
          workplaces. Signed-in professionals can prepare their profile, while
          authorised employers can create, review, and publish employer-owned
          job drafts.
        </p>
      </section>

      <section class="space-y-3">
        <h3 class="fx-type-card-title">Current capabilities</h3>
        <ul class="space-y-2">
          <li>
            <strong>Published job directory</strong>
            &nbsp;— open public roles are projected with bounded Business and
            Place information.
          </li>
          <li>
            <strong>Employer-authored drafts</strong>
            &nbsp;— authorised employers can create and manage private drafts
            before publishing them.
          </li>
          <li>
            <strong>Professional profiles</strong>
            &nbsp;— job seekers can maintain a reusable professional profile
            without duplicating their core User identity.
          </li>
          <li>
            <strong>Applications and engagements</strong>
            &nbsp;— professionals can apply, employers can make an offer, and an
            accepted offer becomes a private engagement.
          </li>
        </ul>
      </section>

      <section class="space-y-3">
        <h3 class="fx-type-card-title">Direct employment</h3>
        <p>
          The named employer—not the platform—employs and pays each person
          directly. The platform records applications, offers, and engagement
          progress without becoming the employer or moving wages.
        </p>
      </section>

      <section class="space-y-3">
        <h3 class="fx-type-card-title">Choose your next step</h3>
        <div class="flex flex-wrap gap-2">
          <UButton to="/jobs" color="primary">Browse jobs</UButton>
          <UButton to="/dashboard/professional/profile" variant="soft">
            Prepare your profile
          </UButton>
          <UButton to="/jobs/manage" color="neutral" variant="ghost">
            Employer tools
          </UButton>
        </div>
      </section>
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
import { useFireUXConfig } from 'fireux-core/runtime/app/composables/config/FireUXConfig'
import { useSeo } from 'fireux-core/runtime/composables/fireux/seo/useSeo'

definePageMeta({
  layout: 'default',
})

const { appName } = useFireUXConfig()
useSeo({
  title: `${appName} | About Jobs`,
  description:
    'Browse published opportunities, prepare a professional profile, or publish a role as an employer.',
  path: '/jobs/learn-more',
})
</script>
