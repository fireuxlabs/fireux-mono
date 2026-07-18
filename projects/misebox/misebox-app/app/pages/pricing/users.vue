<template>
  <div class="fx-page-stack fx-page-stack--comfortable">
    <section class="py-16">
      <UContainer class="space-y-6">
        <UBadge color="primary" variant="soft">{{ appName }} Pricing</UBadge>

        <h1 class="fx-type-page-title">
          Users
        </h1>

        <p class="fx-type-description text-toned">
          Joining {{ appName }} is free.
        </p>

        <p class="text-toned">
          People can create profiles and interact with the ecosystem. Operational access is billed only when someone uses the console.
        </p>
      </UContainer>
    </section>

    <section>
      <UContainer class="grid gap-6 lg:grid-cols-2">
        <UCard>
          <template #header>
            <h2 class="fx-type-card-heading">Free access</h2>
          </template>

          <ul class="fx-type-caption space-y-2 text-toned">
            <li class="flex gap-2"><UIcon name="i-lucide-check" /><span>Create an account</span></li>
            <li class="flex gap-2"><UIcon name="i-lucide-check" /><span>Create profiles</span></li>
            <li class="flex gap-2"><UIcon name="i-lucide-check" /><span>Browse public pages</span></li>
            <li class="flex gap-2"><UIcon name="i-lucide-check" /><span>Use ecosystem features</span></li>
          </ul>
        </UCard>

        <UCard class="border-primary/30 bg-primary/5">
          <template #header>
            <h2 class="fx-type-card-heading">Console seats</h2>
          </template>

          <p class="fx-type-caption text-toned">
            A console seat is required only when a user manages private operational records.
          </p>

          <div class="mt-4 text-3xl font-semibold text-primary">
            $5 / month
          </div>

          <p class="mt-2 text-xs text-gray-500">
            Per console user
          </p>
        </UCard>
      </UContainer>
    </section>
  </div>
</template>

<script setup lang="ts">
const appName = 'Misebox'

definePageMeta({
  layout: 'landing',
})

useSeoMeta({
  title: `User Pricing · ${appName}`,
  description: `${appName} users are free. Console seats are billed only when operational access is required.`,
})
</script>
