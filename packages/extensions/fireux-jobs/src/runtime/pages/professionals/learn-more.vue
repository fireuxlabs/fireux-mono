<template>
  <UPage>
    <UPageHeader
      title="Learn More: Professional Profile"
      description="Your public identity across the FireUX ecosystem."
    />

    <UPageBody class="space-y-4 text-sm">
      <p>
        A Professional Profile introduces who you are, what you do, and what
        kind of work you are seeking. It is the single source that follows you
        into every FireUX experience—no duplication, no extra setup.
      </p>

      <div>
        <h2 class="font-semibold">With a Professional Profile you can:</h2>
        <ul class="mt-2 list-disc space-y-1 pl-6">
          <li>Appear in listings and searches used by agents.</li>
          <li>Apply for jobs with a consistent, trusted identity.</li>
          <li>Be discovered by teams looking for your skills.</li>
          <li>Build your reputation across all FireUX apps.</li>
        </ul>
      </div>

      <p>
        Your avatar, display name, and subtitle form your core presence; your
        experience fills in the story behind the card. Keep it current and it
        will work everywhere on your behalf.
      </p>
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
import { useHead } from '#imports'

useHead({ title: 'Professional Profile · Learn More' })
</script>
