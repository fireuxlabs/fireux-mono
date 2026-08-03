<template>
  <UPage>
    <UPageHeader
      title="Learn more: Hiring profile"
      description="Present your business to the talent you want to hire."
    />

    <UPageBody class="pagebody">
      <p>
        A hiring profile represents the team posting jobs for a business,
        kitchen, or venue. It gives professionals a clear sense of who is
        posting before they apply.
      </p>

      <div>
        <h2 class="font-semibold">With a hiring profile you can:</h2>
        <ul class="mt-2 list-disc space-y-1 pl-6">
          <li>Post jobs that surface across the FireUX network.</li>
          <li>Manage applicants with a consistent brand presence.</li>
          <li>Build a trusted identity that professionals can evaluate.</li>
          <li>Represent your venue professionally in every interaction.</li>
        </ul>
      </div>

      <p>
        Your profile acts as the public page for your organisation. As the
        platform expands you will unlock richer business tools, analytics, and
        team management features.
      </p>
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
import { useHead } from 'nuxt/app'

definePageMeta({
  visibility: { profiles: ['agent'] },
})

useHead({ title: 'Hiring profile · Learn more' })
</script>
