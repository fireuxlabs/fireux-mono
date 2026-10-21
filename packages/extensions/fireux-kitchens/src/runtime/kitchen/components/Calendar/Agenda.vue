<template>
  <UCard>
    <div class="flex items-center gap-3">
      <UIcon name="i-lucide-calendar-clock" class="size-5 text-primary" />
      <h2 class="font-semibold">Kitchen agenda</h2>
      <UBadge color="neutral" variant="subtle" class="ml-auto">Not connected</UBadge>
    </div>
    <div class="py-8 text-center">
      <UIcon name="i-lucide-calendar-range" class="mb-3 size-8 text-muted" />
      <p class="font-medium">No events connected yet</p>
      <p class="mx-auto mt-2 max-w-md text-sm leading-6 text-muted">Scheduled Kitchen work will appear here when a capability provides it. Choose a date above to explore the calendar.</p>
    </div>
  </UCard>
</template>
