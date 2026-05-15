<template>
  <section class="landing-index-section">
    <UCard>
      <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div class="space-y-1">
          <p class="text-sm font-semibold">Operate the first Find My SEO loop from one app</p>
          <p class="text-sm text-[color:var(--ui-text-muted)]">
            Public discovery stays front and center while SEO users manage profiles, case studies, and leads from a light dashboard.
          </p>
        </div>

        <div class="flex flex-wrap gap-3">
          <UButton to="/professionals" color="primary" icon="i-lucide-briefcase-business">
            Open directory
          </UButton>
          <UButton to="/dashboard/professional" variant="outline" icon="i-lucide-layout-dashboard">
            Provider dashboard
          </UButton>
        </div>
      </div>
    </UCard>
  </section>
</template>
