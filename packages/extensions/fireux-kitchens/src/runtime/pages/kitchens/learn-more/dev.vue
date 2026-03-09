<template>
  <UPage>
    <UPageHeader
      class="pageheader"
      title="Kitchens: Learn More (Dev)"
      description="Technical reference for kitchen records, runtime modes, and console surfaces."
    />

    <UPageBody class="pagebody space-y-6">
      <UCard>
        <template #header>
          <h2 class="text-lg font-semibold">Canonical records</h2>
        </template>

        <ul class="list-disc space-y-2 pl-5 text-sm">
          <li>Live runtime path: <code>kitchens/&lt;kitchenId&gt;</code>.</li>
          <li>Test runtime path: <code>test-kitchens/&lt;kitchenId&gt;</code>.</li>
          <li>Read-only mode is scenario-backed and does not write to Firestore.</li>
        </ul>
      </UCard>

      <UCard>
        <template #header>
          <h2 class="text-lg font-semibold">Primary surfaces</h2>
        </template>

        <div class="space-y-2 text-sm">
          <div class="rounded border border-default p-3">
            <p class="font-mono">/kitchens</p>
            <p class="text-dimmed">Public runtime index for kitchen records.</p>
          </div>
          <div class="rounded border border-default p-3">
            <p class="font-mono">/console/kitchen/overview</p>
            <p class="text-dimmed">Canonical kitchen console entry point.</p>
          </div>
          <div class="rounded border border-default p-3">
            <p class="font-mono">/console/kitchen/&lt;page&gt;</p>
            <p class="text-dimmed">Scoped kitchen console pages such as menu, recipes, ingredients, and team.</p>
          </div>
        </div>
      </UCard>

      <div class="flex flex-wrap gap-2">
        <UButton to="/kitchens" color="primary" icon="i-lucide-chef-hat">Open kitchens</UButton>
        <UButton to="/kitchens/learn-more" color="neutral" variant="soft" icon="i-lucide-book-open">Public guide</UButton>
      </div>
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
import { useHead } from '#imports'
import { useFireUXConfig } from 'fireux-core/runtime/composables/fireux/app/FireUXConfig'

definePageMeta({
  layout: 'default',
  name: 'KitchensLearnMoreDevPage',
})

const { appName } = useFireUXConfig()
const title = `${appName} | Kitchens · Learn more (Dev)`

useHead({ title })

useSeoMeta({
  title,
  description: 'Technical reference for kitchen records, runtime modes, and console surfaces.',
})
</script>
