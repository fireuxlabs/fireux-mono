<template>
  <UPageCTA
    data-entity-create-family="project"
    title="Create a Project"
    description="Open the Project workspace to create and organise your Apps."
    variant="naked"
  >
    <template #links>
      <UButton
        to="/workspace/project"
        icon="i-lucide-folder-plus"
        color="primary"
      >
        Create Project
      </UButton>
    </template>
  </UPageCTA>
</template>
