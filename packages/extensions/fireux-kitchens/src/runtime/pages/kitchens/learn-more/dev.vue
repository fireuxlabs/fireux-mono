<template>
  <UPage>
    <UPageHeader
      class="pageheader"
      title="Kitchens: Learn More (Dev)"
      description="Technical reference for kitchen records, runtime modes, and workspace surfaces."
    />

    <UPageBody class="pagebody">
      <UCard>
        <template #header>
          <h2>Canonical records</h2>
        </template>

        <ul class="fx-list-stack">
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
          <h2>Primary surfaces</h2>
        </template>

        <div class="fx-card-body-stack">
          <div class="fx-inset-panel">
            <p>/kitchens</p>
            <p>Public runtime index for kitchen records.</p>
          </div>
          <div class="fx-inset-panel">
            <p>/workspace/kitchen</p>
            <p>Canonical kitchen workspace entry point.</p>
          </div>
          <div class="fx-inset-panel">
            <p>/workspace/kitchen/&lt;page&gt;</p>
            <p>
              Scoped kitchen workspace pages such as menu, recipes, ingredients,
              and team.
            </p>
          </div>
        </div>
      </UCard>

      <div>
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
