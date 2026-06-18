<template>
  <UPageCTA
    data-entity-cta-family="platform-app"
    title="Apps"
    description="Find apps in this ecosystem, or start your app."
    orientation="horizontal"
  >
    <template #links>
      <div class="flex flex-wrap gap-2">
        <UButton
          color="primary"
          variant="soft"
          icon="i-lucide-rocket"
          to="/get-started"
        >
          Start your app
        </UButton>
        <UButton
          color="neutral"
          variant="soft"
          icon="i-lucide-badge-dollar-sign"
          to="/pricing/apps"
        >
          View pricing
        </UButton>
      </div>
    </template>
  </UPageCTA>
</template>
