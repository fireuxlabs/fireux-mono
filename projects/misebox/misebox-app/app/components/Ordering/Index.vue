<template>
  <div class="space-y-12 pb-16">
    <section class="border-b border-gray-200/60 bg-white/70 py-16 dark:border-gray-800/50 dark:bg-gray-900/40">
      <UContainer class="space-y-5">
        <UBadge color="primary" variant="soft">
          Misebox ordering
        </UBadge>

        <div class="max-w-3xl space-y-4">
          <h1 class="text-4xl font-semibold tracking-tight text-gray-900 dark:text-white md:text-6xl">
            Online ordering that becomes operations.
          </h1>
          <p class="text-lg leading-8 text-gray-600 dark:text-gray-300">
            Each ordering flow starts from a menu, then gathers the extra
            context needed to create a useful order for the kitchen, customer,
            and delivery network.
          </p>
        </div>
      </UContainer>
    </section>

    <section class="space-y-10">
      <UContainer
        v-for="family in families"
        :key="family.name"
        class="space-y-4"
      >
        <div class="space-y-1">
          <p class="text-xs font-bold uppercase tracking-[0.18em] text-primary">
            {{ family.name }}
          </p>
          <h2 class="text-2xl font-semibold tracking-tight text-highlighted">
            {{ family.heading }}
          </h2>
        </div>

        <div class="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <UCard
            v-for="flow in family.flows"
            :key="flow.to"
            class="h-full"
          >
            <template #header>
              <div class="flex items-start gap-3">
                <UIcon
                  :name="flow.icon"
                  class="mt-1 size-5 text-primary"
                  aria-hidden="true"
                />
                <div>
                  <h3 class="text-lg font-semibold">
                    {{ flow.title }}
                  </h3>
                  <p class="text-sm text-dimmed">
                    {{ flow.subtitle }}
                  </p>
                </div>
              </div>
            </template>

            <p class="text-sm leading-6 text-muted">
              {{ flow.body }}
            </p>

            <template #footer>
              <UButton
                :to="flow.to"
                color="primary"
                variant="soft"
                trailing-icon="i-lucide-arrow-right"
              >
                Learn more
              </UButton>
            </template>
          </UCard>
        </div>
      </UContainer>
    </section>
  </div>
</template>

<script setup lang="ts">
import {
  orderingPageCards,
  orderingPageFamilies,
  type OrderingPageFamily,
} from '../../utils/orderingPages'

const familyHeadings: Record<OrderingPageFamily, string> = {
  Delivery: 'Bring food to the guest.',
  Pickup: 'Let guests collect at the right time.',
  'On-premise': 'Order from the table, bar, counter, or kiosk.',
  Scheduled: 'Plan future food before service starts.',
  Marketplace: 'Accept external channel orders without losing control.',
  'Guest stay': 'Turn stays into local recommendations and food opportunities.',
  'Prepared food': 'Centralise meal prep, hampers, and ready-to-finish food.',
}
const families = orderingPageFamilies.map((family) => ({
  name: family,
  heading: familyHeadings[family],
  flows: orderingPageCards.filter((flow) => flow.family === family),
}))
</script>
