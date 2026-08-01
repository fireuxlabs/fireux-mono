<!-- Concurrent edit — 2026-07-23 15:48 CEST — Keep the shared Jobs guide truthful about browse, profile, and employer capabilities. -->
<template>
  <UPage>
    <UPageHeader
      title="About Jobs"
      description="Browse published opportunities, prepare a professional profile, or publish a role as an employer."
    />

    <UPageBody class="pagebody">
      <section class="space-y-3">
        <h2 class="text-lg font-semibold">What you can do today</h2>
        <p class="text-sm text-toned">
          Explore open public roles connected to canonical employers and
          workplaces. Signed-in professionals can prepare their profile, while
          authorised agents can create, review, and publish employer-owned job
          drafts.
        </p>
      </section>

      <section class="space-y-3">
        <h3 class="text-base font-semibold">Current capabilities</h3>
        <ul class="space-y-2 text-sm text-toned">
          <li>
            <strong class="font-medium text-highlighted"
              >Published job directory</strong
            >
            &nbsp;— open public roles are projected with bounded Company and
            Place information.
          </li>
          <li>
            <strong class="font-medium text-highlighted"
              >Agent-authored drafts</strong
            >
            &nbsp;— authorised agents can create and manage private drafts
            before publishing them.
          </li>
          <li>
            <strong class="font-medium text-highlighted"
              >Professional profiles</strong
            >
            &nbsp;— job seekers can maintain a reusable professional profile
            without duplicating their core User identity.
          </li>
          <li>
            <strong class="font-medium text-highlighted"
              >Applications and engagements</strong
            >
            &nbsp;— professionals can apply, employers can make an offer, and an
            accepted offer becomes a private engagement.
          </li>
        </ul>
      </section>

      <section class="space-y-3">
        <h3 class="text-base font-semibold">Direct employment</h3>
        <p class="text-sm text-toned">
          The named employer—not the platform—employs and pays each person
          directly. The platform records applications, offers, and engagement
          progress without becoming the employer or moving wages.
        </p>
      </section>

      <section class="space-y-3">
        <h3 class="text-base font-semibold">Choose your next step</h3>
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
import { useFireUXConfig } from 'fireux-core/runtime/composables/fireux/app/FireUXConfig'
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
