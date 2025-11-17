<template>
  <UPage>
    <UPageHeader
      title="Learn More: Chef Profile"
      description="Highlight your craft for kitchens that need the right talent."
    />

    <UPageBody class="space-y-4 text-sm">
      <p>
        A Chef Profile shines a light on your station experience, cuisine focus,
        and strengths on the line. It layers on top of your Professional Profile
        so teams can understand exactly how you operate in the kitchen.
      </p>

      <div>
        <h2 class="font-semibold">With a Chef Profile you can:</h2>
        <ul class="mt-2 list-disc space-y-1 pl-6">
          <li>Showcase your culinary expertise and signature stations.</li>
          <li>Be matched to shifts and roles based on experience.</li>
          <li>Build credibility with the kitchens reviewing your profile.</li>
          <li>Add chef-specific depth without duplicating core details.</li>
        </ul>
      </div>

      <p>
        As the Misebox kitchen ecosystem grows, this profile will unlock
        additional chef-focused tools and opportunities tailored to your craft.
      </p>
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
import { useHead } from '#imports'

useHead({ title: 'Chef Profile · Learn More' })
</script>
