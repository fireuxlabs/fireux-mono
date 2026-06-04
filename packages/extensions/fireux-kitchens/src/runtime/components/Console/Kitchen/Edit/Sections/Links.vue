<template>
  <aside class="space-y-4">
    <UCard>
      <template #header>
        <div class="flex items-start gap-3">
          <UIcon name="i-lucide-map-pin" class="mt-1 size-5 shrink-0 text-muted" />
          <div>
            <div class="text-base font-semibold text-highlighted">
              Place
            </div>
            <p class="text-sm text-dimmed">
              Real-world location details now live on their own page.
            </p>
          </div>
        </div>
      </template>

      <UButton
        color="neutral"
        variant="soft"
        icon="i-lucide-map-pin"
        to="/console/kitchen/identity/place"
      >
        Open place
      </UButton>
    </UCard>

    <UCard>
      <template #header>
        <div class="flex items-start gap-3">
          <UIcon name="i-lucide-palette" class="mt-1 size-5 shrink-0 text-muted" />
          <div>
            <div class="text-base font-semibold text-highlighted">
              Themes
            </div>
            <p class="text-sm text-dimmed">
              Menu colours and price display now live on their own page.
            </p>
          </div>
        </div>
      </template>

      <UButton
        color="neutral"
        variant="soft"
        icon="i-lucide-palette"
        to="/console/kitchen/identity/theme"
      >
        Open themes
      </UButton>
    </UCard>

    <UCard>
      <template #header>
        <div class="flex items-start gap-3">
          <UIcon name="i-lucide-plug" class="mt-1 size-5 shrink-0 text-muted" />
          <div>
            <div class="text-base font-semibold text-highlighted">
              Plugins
            </div>
            <p class="text-sm text-dimmed">
              Optional tools for menu language and kitchen workflows.
            </p>
          </div>
        </div>
      </template>

      <UButton
        color="neutral"
        variant="soft"
        icon="i-lucide-plug"
        to="/console/kitchen/identity/plugins"
      >
        Open plugins
      </UButton>
    </UCard>
  </aside>
</template>
