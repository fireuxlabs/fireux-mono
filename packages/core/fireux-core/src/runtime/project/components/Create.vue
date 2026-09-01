<template>
  <UPageCard
    data-entity-create-family="project"
    title="Create a Project"
    description="Open the Project workspace to create and organise your Apps."
    orientation="horizontal"
    variant="naked"
  >
    <template #footer>
      <UButton
        to="/"
        icon="i-lucide-folder-plus"
        color="primary"
      >
        Create Project
      </UButton>
    </template>
  </UPageCard>
</template>
