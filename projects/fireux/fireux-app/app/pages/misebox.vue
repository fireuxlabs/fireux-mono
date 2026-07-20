<!-- Concurrent edit — 2026-07-20 23:38 CEST — Final app CSS pass: semantic colors. -->
<template>
  <UPage>
    <UPageHeader
      title="Misebox"
      description="The hospitality ecosystem within FireUX."
    />

    <UPageBody class="pagebody">
      <UCard class="space-y-3">
        <p class="text-sm text-toned">
          Misebox is the hospitality ecosystem: chefs, kitchens, suppliers, and
          real-world work coordination.
        </p>

        <div class="space-y-2 text-sm text-toned">
          <p>Next: surface Misebox apps and the main operational flows.</p>
          <p>
            Ecosystem index lives at
            <NuxtLink class="text-primary hover:underline" to="/ecosystems">
              /ecosystems
            </NuxtLink>
            .
          </p>
        </div>
      </UCard>
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
definePageMeta({
  title: 'Misebox',
})

useSeoMeta({
  title: 'Misebox · FireUX',
  description: 'Misebox ecosystem landing page.',
})
</script>
