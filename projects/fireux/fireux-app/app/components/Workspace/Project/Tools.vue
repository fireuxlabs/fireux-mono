<template>
  <section aria-labelledby="project-tools" class="grid gap-4">
    <div class="flex flex-wrap items-end justify-between gap-3">
      <div class="grid max-w-2xl gap-1">
        <h2
          id="project-tools"
          class="m-0 text-2xl font-semibold text-highlighted"
        >
          Project tools
        </h2>
        <p class="m-0 text-sm leading-6 text-muted">
          Bounded actions proposed from current SaaS Project demand.
        </p>
      </div>
      <UButton
        to="/search-demand"
        label="Review Project demand"
        color="neutral"
        variant="link"
        trailing-icon="i-lucide-arrow-right"
      />
    </div>

    <div class="grid gap-3 md:grid-cols-2">
      <UPageCard
        title="Production Readiness Review"
        description="The sole test-now Tool hypothesis. It is not yet an implemented Project Tool."
        icon="i-lucide-shield-check"
        to="/search-demand"
        variant="subtle"
      />
    </div>
  </section>
</template>
