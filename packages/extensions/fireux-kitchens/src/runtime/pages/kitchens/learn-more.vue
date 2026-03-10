<template>
  <UPage>
    <UPageHeader
      class="pageheader"
      title="Kitchens: Learn More"
      description="How kitchen records connect runtime operations, place identity, and service execution."
    />

    <UPageBody class="pagebody space-y-6">
      <UCard>
        <template #header>
          <h2 class="text-lg font-semibold">What kitchens are</h2>
        </template>

        <ul class="list-disc space-y-2 pl-5 text-sm">
          <li>Kitchens are the runtime records used to manage service operations.</li>
          <li>They stay linked to place identity while carrying kitchen-specific operational state.</li>
          <li>The kitchen console is where menus, recipes, mise, orders, and team surfaces come together.</li>
        </ul>
      </UCard>

      <UCard>
        <template #header>
          <h2 class="text-lg font-semibold">How to use kitchens</h2>
        </template>

        <ol class="list-decimal space-y-2 pl-5 text-sm">
          <li>Create or claim a kitchen record inside the active runtime.</li>
          <li>Use the kitchen console to move from overview into menus, ingredients, dishes, and service workflows.</li>
          <li>Keep public identity and private operational flow aligned through the same kitchen record.</li>
        </ol>
      </UCard>

      <div class="flex flex-wrap gap-2">
        <UButton to="/kitchens" color="primary" icon="i-lucide-chef-hat">Open kitchens</UButton>
        <UButton to="/kitchens/learn-more/dev" color="neutral" variant="soft" icon="i-lucide-code-2">Dev details</UButton>
        <UButton to="/console/kitchen/overview" color="neutral" variant="soft" icon="i-lucide-layout-dashboard">Enter Kitchen Console</UButton>
        <UButton to="/kitchens/create" color="neutral" variant="ghost" icon="i-lucide-plus">Create kitchen</UButton>
      </div>
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
import { useHead } from '#imports'
import { useFireUXConfig } from 'fireux-core/runtime/composables/fireux/app/FireUXConfig'

definePageMeta({
  layout: 'default',
  name: 'KitchensLearnMorePage',
})

const { appName } = useFireUXConfig()
useHead({ title: `${appName} | Kitchens · Learn more` })

useSeoMeta({
  title: `${appName} | Kitchens · Learn more`,
  description: 'How kitchen records connect runtime operations, place identity, and service execution.',
})
</script>
