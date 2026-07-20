<!-- Concurrent edit — 2026-07-20 23:33 CEST — Final app CSS pass: semantic colors. -->
<template>
  <div class="fx-page-stack fx-page-stack--comfortable">
    <section class="py-16">
      <UContainer class="space-y-6">
        <UBadge color="primary" variant="soft">{{ appName }} Pricing</UBadge>

        <h1 class="fx-type-page-title">
          Apps
        </h1>

        <p class="fx-type-description text-toned">
          You can launch your own app inside the {{ appName }} ecosystem.
        </p>

        <p class="text-toned">
          This path is for teams that want to move fast inside an ecosystem that already exists.
        </p>
      </UContainer>
    </section>

    <section>
      <UContainer class="grid gap-6 lg:grid-cols-2">
        <UCard class="border-primary/40 ring-1 ring-primary/20">
          <template #header>
            <h2 class="fx-type-card-heading">Join this ecosystem</h2>
          </template>

          <p class="fx-type-caption text-toned">
            Your app runs inside {{ appName }}. The ecosystem layer is already operated here.
          </p>

          <div class="mt-6 grid grid-cols-2 gap-4">
            <div>
              <p class="text-xs uppercase text-muted">Setup</p>
              <p class="text-xl font-semibold">$600</p>
            </div>
            <div>
              <p class="text-xs uppercase text-muted">Maintenance</p>
              <p class="text-xl font-semibold">$50 / month</p>
            </div>
          </div>
        </UCard>

        <UCard>
          <template #header>
            <h2 class="fx-type-card-heading">Console seats</h2>
          </template>

          <p class="fx-type-caption text-toned">
            Console seats are billed only for operators managing private records.
          </p>

          <div class="mt-4 text-3xl font-semibold text-primary">
            $5 / month
          </div>

          <p class="mt-2 text-xs text-muted">
            Per console user
          </p>
        </UCard>
      </UContainer>
    </section>
  </div>
</template>

<script setup lang="ts">
const appName = 'Cleanbox'

definePageMeta({
  layout: 'landing',
})

useSeoMeta({
  title: `App Pricing · ${appName}`,
  description: `App pricing for launching inside the ${appName} ecosystem.`,
})
</script>
