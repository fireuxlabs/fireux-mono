<template>
  <UPageCTA
    title="Ecosystem collection"
    description="This index reads directly from db.collections.ecosystems. If none exist yet, the list should stay at zero."
    orientation="horizontal"
  >
    <template #links>
      <div class="grid gap-3 sm:grid-cols-3">
        <section class="space-y-2">
          <p class="text-sm font-semibold">Collection index</p>
          <UButton
            block
            color="primary"
            variant="soft"
            icon="i-lucide-orbit"
            to="/ecosystems"
          >
            Open collection
          </UButton>
        </section>

        <section class="space-y-2">
          <p class="text-sm font-semibold">Console</p>
          <UButton
            block
            color="primary"
            variant="soft"
            icon="i-lucide-terminal"
            to="/console"
          >
            Open console
          </UButton>
        </section>

        <section class="space-y-2">
          <p class="text-sm font-semibold">Guide</p>
          <UButton
            block
            color="primary"
            variant="soft"
            icon="i-lucide-book-open"
            to="/ecosystems/learn-more"
          >
            Learn more
          </UButton>
        </section>
      </div>
    </template>

    <template #default>
      <img
        src="https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=640&h=520&q=80"
        width="640"
        height="520"
        alt="Ecosystem network"
        class="w-full rounded-lg object-cover"
        loading="lazy"
      >
    </template>
  </UPageCTA>
</template>
