<!-- Concurrent edit — 2026-07-21 16:03 CEST — Extension module catalogue: replace empty Product records with reusable package cards. -->
<template>
  <section class="grid gap-5" aria-labelledby="extension-modules-title">
    <div class="flex items-end justify-between gap-4">
      <div class="grid gap-1">
        <h2
          id="extension-modules-title"
          class="m-0 text-xl font-semibold text-highlighted"
        >
          Extension modules
        </h2>
        <p class="m-0 text-sm leading-6 text-muted">
          Reusable capabilities composed into FireUX apps.
        </p>
      </div>
      <UBadge color="neutral" variant="soft">
        {{ fireuxExtensionModules.length }} modules
      </UBadge>
    </div>

    <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      <UCard
        v-for="module in fireuxExtensionModules"
        :key="module.id"
        variant="subtle"
        class="h-full"
      >
        <div class="grid gap-4">
          <div class="flex items-start gap-3">
            <div class="flex size-10 shrink-0 items-center justify-center rounded-lg bg-elevated">
              <UIcon :name="module.icon" class="size-5 text-primary" />
            </div>
            <div class="min-w-0">
              <h3 class="m-0 font-semibold text-highlighted">
                {{ module.name }}
              </h3>
              <code class="text-xs text-dimmed">{{ module.id }}</code>
            </div>
          </div>
          <p class="m-0 text-sm leading-6 text-muted">
            {{ module.description }}
          </p>
        </div>
      </UCard>
    </div>
  </section>
</template>

<script setup lang="ts">
import { fireuxExtensionModules } from '../../../module-catalogue'
</script>
