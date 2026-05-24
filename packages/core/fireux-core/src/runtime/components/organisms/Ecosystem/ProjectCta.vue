<template>
  <UCard>
    <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div class="max-w-2xl space-y-1">
        <h2 class="text-lg font-semibold text-highlighted">Managed through Project</h2>
        <p class="text-sm text-muted">
          Ecosystem records are public identity records. Project Console manages their setup, ownership, and app relationships.
        </p>
      </div>

      <div class="flex flex-wrap gap-2">
        <UButton
          to="/console/project"
          color="neutral"
          variant="soft"
          icon="i-lucide-layout-dashboard"
        >
          Project Console
        </UButton>
        <UButton
          to="/console/project/ecosystem"
          color="neutral"
          variant="ghost"
          icon="i-lucide-orbit"
        >
          Ecosystem record
        </UButton>
      </div>
    </div>
  </UCard>
</template>
