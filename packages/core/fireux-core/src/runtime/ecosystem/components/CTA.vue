<template>
  <UPageCTA
    data-entity-cta-family="workspace"
    title="Ecosystems"
    description="Explore FireUX ecosystems and the apps they bring together."
    orientation="horizontal"
  >
    <template #links>
      <div class="grid gap-3 sm:grid-cols-3">
        <section class="space-y-2">
          <p class="text-sm font-semibold">Ecosystems</p>
          <UButton
            block
            color="primary"
            variant="soft"
            icon="i-lucide-orbit"
            to="/ecosystems"
          >
            Browse ecosystems
          </UButton>
        </section>

        <section class="space-y-2">
          <p class="text-sm font-semibold">Workspace</p>
          <UButton
            block
            color="primary"
            variant="soft"
            icon="i-lucide-terminal"
            to="/workspace/project"
          >
            Open workspace
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
      />
    </template>
  </UPageCTA>
</template>
