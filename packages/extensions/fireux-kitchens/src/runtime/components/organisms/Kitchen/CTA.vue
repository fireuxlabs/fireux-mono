<template>
  <UPageCTA
    class="cta"
    title="Kitchen dashboard"
    description="Use your test kitchen to open the dashboard or learn more about kitchens."
    variant="soft"
    orientation="horizontal"
  >
    <template #links>
      <div class="flex flex-wrap items-center gap-3">
        <KitchenMyKitchensCta />
        <UButton
          size="sm"
          variant="subtle"
          color="neutral"
          to="/dashboard/kitchen"
          trailing-icon="i-lucide-arrow-right"
        >
          go to dash
        </UButton>
      </div>
    </template>
    <template #default>
      <img
        src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=640&h=520&q=80"
        width="640"
        height="520"
        alt="Kitchen"
        class="w-full rounded-lg object-cover"
        loading="lazy"
      />
    </template>
  </UPageCTA>
</template>
