<template>
  <main class="min-h-screen bg-muted/30 py-10">
    <UContainer class="max-w-6xl space-y-6">
      <UButton
        to="/ordering"
        color="neutral"
        variant="soft"
        icon="i-lucide-arrow-left"
      >
        Ordering
      </UButton>

      <section
        class="rounded-lg border border-default bg-default p-5 shadow-sm"
      >
        <div
          class="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(20rem,0.9fr)]"
        >
          <div class="space-y-4">
            <div>
              <p class="fx-type-label">Operator surface</p>
              <h1
                class="fx-type-page-title mt-1 text-3xl font-black tracking-tight"
              >
                Staff POS
              </h1>
            </div>

            <p class="fx-type-caption max-w-2xl leading-6">
              Same basket and kitchen ticket spine as kiosk. The surface is
              faster, denser, and starts inside the menu.
            </p>

            <div class="flex flex-wrap gap-2">
              <UButton
                to="/kitchens/indian-gourmet-restaurant-pizzeria/menus/food.staff_pos"
                icon="i-lucide-monitor"
              >
                Open sample POS
              </UButton>

              <UButton
                to="/kitchens/indian-gourmet-restaurant-pizzeria/menus/food.kiosk"
                color="neutral"
                variant="soft"
                icon="i-lucide-tablet"
              >
                Compare kiosk
              </UButton>
            </div>
          </div>

          <OrderingObjectShape title="staff POS intake" :data="shape" />
        </div>
      </section>
    </UContainer>
  </main>
</template>

<script setup lang="ts">
const shape = {
  route: {
    menuId: 'food',
    kitchenSlug: 'indian-gourmet-restaurant-pizzeria',
    context: 'staff_pos',
  },
  order: {
    orderType: 'eat_in',
    basket: {
      items: [],
      quantity: 0,
    },
    operator: {
      id: 'signed-in-user',
    },
  },
  modes: ['eat_in', 'takeaway'],
}

definePageMeta({
  layout: 'landing',
  name: 'MiseboxOrderingStaffPosPage',
})

useSeoMeta({
  title: 'Staff POS Ordering · Misebox',
  description:
    'Misebox staff POS ordering for fast in-store eat-in and takeaway orders.',
})
</script>
