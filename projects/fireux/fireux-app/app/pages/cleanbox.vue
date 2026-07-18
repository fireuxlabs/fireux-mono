<template>
  <UPage>
    <UPageHeader
      title="Cleanbox"
      description="The cleaning ecosystem within FireUX."
    />

    <UPageBody class="pagebody">
      <UCard class="space-y-3">
        <p class="text-sm text-toned">
          Cleanbox is the operational ecosystem for cleaning work. This route is
          the landing page for that domain.
        </p>

        <div class="space-y-2 text-sm text-toned">
          <p>Next: show Cleanbox apps and the primary entry points.</p>
          <p>
            If you're looking for the system-wide list of ecosystems, go to
            <NuxtLink class="text-primary-500 hover:underline" to="/ecosystems">
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
  title: 'Cleanbox',
})

useSeoMeta({
  title: 'Cleanbox · FireUX',
  description: 'Cleanbox ecosystem landing page.',
})
</script>
