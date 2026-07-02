<template>
  <main class="min-h-screen bg-muted/30 py-10">
    <UContainer class="max-w-3xl space-y-6">
      <UButton
        to="/ordering"
        color="neutral"
        variant="soft"
        icon="i-lucide-arrow-left"
      >
        Ordering
      </UButton>

      <section class="space-y-3">
        <p class="text-xs font-bold uppercase tracking-[0.2em] text-primary">
          Hotel funnel
        </p>
        <h1 class="text-4xl font-black tracking-tight text-highlighted">
          Room service ordering
        </h1>
        <p class="text-muted">
          A delivery-shaped funnel for hotels, aparthotels, serviced apartments,
          and private rooms where destination is a room or guest stay.
        </p>
      </section>

      <UCard :ui="{ body: 'space-y-4' }">
        <h2 class="text-2xl font-black tracking-tight">
          Screen stack
        </h2>
        <ol class="list-decimal space-y-2 pl-5 text-muted">
          <li>Basket</li>
          <li>Allergy check</li>
          <li>Room destination</li>
          <li>Kitchen timing</li>
          <li>Room charge or payment</li>
          <li>Confirmation</li>
        </ol>
      </UCard>
    </UContainer>
  </main>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'landing',
  name: 'MiseboxOrderingRoomServicePage',
})

useSeoMeta({
  title: 'Room Service Ordering · Misebox',
  description:
    'Misebox room service ordering for hotels, guest rooms, serviced apartments, and private room delivery.',
})
</script>
