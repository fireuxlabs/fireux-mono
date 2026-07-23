<!-- Concurrent edit — 2026-07-23 15:48 CEST — Keep the Jobs doorway candidate-first while reusing shared Misebox identity and auth chrome. -->
<template>
  <div class="fx-layout-shell" data-misebox-jobs-layout>
    <LayoutsDefaultHeader />

    <div class="border-b border-default bg-default/80 backdrop-blur">
      <UContainer
        class="flex flex-col gap-3 py-3 sm:flex-row sm:items-center sm:justify-between"
      >
        <NuxtLink
          to="/jobs"
          class="inline-flex items-center gap-2 font-semibold text-highlighted"
        >
          <span
            class="grid size-8 place-items-center rounded-lg bg-primary/10 text-primary"
          >
            <UIcon name="i-lucide-briefcase-business" aria-hidden="true" />
          </span>
          Misebox Jobs
        </NuxtLink>

        <nav
          class="flex items-center gap-1 overflow-x-auto"
          aria-label="Misebox Jobs"
        >
          <UButton
            to="/jobs"
            color="neutral"
            variant="ghost"
            size="sm"
          >
            Browse jobs
          </UButton>
          <UButton
            to="/professionals"
            color="neutral"
            variant="ghost"
            size="sm"
          >
            Professionals
          </UButton>
          <UButton
            to="/jobs/manage"
            color="neutral"
            variant="soft"
            size="sm"
          >
            Post a job
          </UButton>
        </nav>
      </UContainer>
    </div>

    <main class="fx-layout-main">
      <UContainer>
        <NuxtPage />
      </UContainer>
    </main>

    <LayoutsDefaultFooter />
  </div>
</template>

<script setup lang="ts">
defineOptions({ name: 'misebox-jobs' })
</script>
