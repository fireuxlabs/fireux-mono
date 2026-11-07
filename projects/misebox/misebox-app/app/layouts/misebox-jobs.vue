<!-- Concurrent edit — 2026-07-23 15:48 CEST — Keep the Jobs doorway candidate-first while reusing shared Misebox identity and auth chrome. -->
<template>
  <div class="fx-layout-shell" data-misebox-jobs-layout>
    <FireLayoutsDefaultHeader />

    <div>
      <UContainer>
        <ULink to="/jobs">
          <span>
            <UIcon name="i-lucide-briefcase-business" aria-hidden="true" />
          </span>
          Misebox Jobs
        </ULink>

        <nav aria-label="Misebox Jobs">
          <UButton to="/jobs" color="neutral" variant="ghost" size="sm">
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
          <UButton to="/jobs/manage" color="neutral" variant="soft" size="sm">
            Post a job
          </UButton>
        </nav>
      </UContainer>
    </div>

    <div class="fx-layout-main">
      <UContainer>
        <slot />
      </UContainer>
    </div>

    <FireLayoutsDefaultFooter />
  </div>
</template>

<script setup lang="ts">
defineOptions({ name: 'misebox-jobs' })
</script>
