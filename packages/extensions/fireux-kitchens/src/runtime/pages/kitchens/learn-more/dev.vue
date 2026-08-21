<template>
  <UPage>
    <UPageHeader
      class="pageheader"
      title="Kitchens: Learn More (Dev)"
      description="Technical reference for kitchen records, runtime modes, and workspace surfaces."
    />

    <UPageBody class="pagebody space-y-6">
      <UCard>
        <template #header>
          <h2 class="text-lg font-semibold">Canonical records</h2>
        </template>

        <ul class="list-disc fx-list-stack text-sm">
          <li>
            Live runtime path: <code>misebox/kitchens/&lt;kitchenId&gt;</code>.
          </li>
          <li>
            Writable test runtime path:
            <code>misebox-simulation/kitchens/&lt;kitchenId&gt;</code>.
          </li>
          <li>
            Local demo scenarios remain read-only code fixtures while the
            product shape is still moving.
          </li>
        </ul>
      </UCard>

      <UCard>
        <template #header>
          <h2 class="text-lg font-semibold">Primary surfaces</h2>
        </template>

        <div class="space-y-2 text-sm">
          <div class="fx-inset-panel">
            <p class="font-mono">/kitchens</p>
            <p class="text-dimmed">Public runtime index for kitchen records.</p>
          </div>
          <div class="fx-inset-panel">
            <p class="font-mono">/workspace/kitchen</p>
            <p class="text-dimmed">Canonical kitchen workspace entry point.</p>
          </div>
          <div class="fx-inset-panel">
            <p class="font-mono">/workspace/kitchen/&lt;page&gt;</p>
            <p class="text-dimmed">
              Scoped kitchen workspace pages such as menu, recipes, ingredients,
              and team.
            </p>
          </div>
        </div>
      </UCard>

      <div class="flex flex-wrap gap-2">
        <UButton to="/kitchens" color="primary" icon="i-lucide-chef-hat"
          >Open kitchens</UButton
        >
        <UButton
          to="/kitchens/learn-more"
          color="neutral"
          variant="soft"
          icon="i-lucide-book-open"
          >Public guide</UButton
        >
      </div>
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
import { useHead } from '#imports'
import { useFireUXConfig } from 'fireux-core/runtime/app/composables/config/FireUXConfig'

definePageMeta({
  layout: 'default',
  name: 'KitchensLearnMoreDevPage',
})

const { appName } = useFireUXConfig()
const title = `${appName} | Kitchens · Learn more (Dev)`

useHead({ title })

useSeoMeta({
  title,
  description:
    'Technical reference for kitchen records, runtime modes, and workspace surfaces.',
})
</script>
