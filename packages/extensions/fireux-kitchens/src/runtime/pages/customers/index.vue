<template>
  <UPage>
    <!-- Public customer centre placeholder: docs/concepts/pages.md · not a full customer entity surface yet. -->
    <UPageHeader
      title="Customer centre"
      description="Your orders, favourites, offers, and useful kitchen updates will live here."
    />

    <UPageBody>
      <UPageCard>
        <div class="space-y-3">
          <UBadge variant="soft">
            Preview
          </UBadge>

          <h2 class="text-xl font-semibold text-highlighted">
            Thanks for ordering.
          </h2>

          <p class="text-sm text-dimmed">
            This will become the customer home for order updates, special
            offers, favourite kitchens, and saved details.
          </p>

          <div class="flex flex-wrap gap-2">
            <UButton
              to="/menus"
              color="neutral"
              variant="soft"
              icon="i-lucide-book-open-check"
            >
              Browse menus
            </UButton>

            <UButton
              to="/"
              color="neutral"
              variant="ghost"
              icon="i-lucide-home"
            >
              Home
            </UButton>
          </div>
        </div>
      </UPageCard>
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
import { useHead } from '#imports'
import { useFireUXConfig } from 'fireux-core/runtime/composables/fireux/app/FireUXConfig'

definePageMeta({
  layout: 'default',
  name: 'CustomersIndexPage',
  title: 'Customer centre',
  description: 'A placeholder customer centre for orders, offers, and saved details.',
})

const { appName } = useFireUXConfig()

useHead({ title: `${appName} | Customer centre` })
</script>
