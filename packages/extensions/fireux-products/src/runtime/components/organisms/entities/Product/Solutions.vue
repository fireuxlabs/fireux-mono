<template>
  <UCard>
    <template #header>
      <div class="space-y-1">
        <h2 class="text-lg font-semibold">Solutions</h2>
        <p class="text-sm text-muted-foreground">
          Jump to dedicated pages for each core FireUX offer.
        </p>
      </div>
    </template>

    <div class="flex flex-wrap gap-2">
      <UButton to="/solutions/fireux-app" color="primary" variant="solid">
        FireUX App
      </UButton>
      <UButton to="/solutions/fireux-template" color="primary" variant="outline">
        FireUX Template
      </UButton>
    </div>
  </UCard>
</template>

