<template>
  <section
    aria-labelledby="project-workspace-operations"
    class="grid gap-5 border-t border-default pt-6"
  >
    <div class="grid max-w-2xl gap-1">
      <h2
        id="project-workspace-operations"
        class="m-0 text-2xl font-semibold text-highlighted"
      >
        What you can do
      </h2>
      <p class="m-0 text-sm leading-6 text-muted">
        Work with the Apps and Ecosystem relationships owned by this Project.
      </p>
    </div>

    <div class="grid gap-3 md:grid-cols-2">
      <UPageCard
        title="Apps"
        description="Inspect the Apps composed by the selected Project."
        icon="i-lucide-panels-top-left"
        to="/operations/apps"
        variant="subtle"
      />
      <UPageCard
        title="Ecosystem"
        description="Inspect the Project's upstream ecosystem relationships."
        icon="i-lucide-orbit"
        to="/operations/ecosystem"
        variant="subtle"
      />
    </div>
  </section>
</template>
