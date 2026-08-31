<template>
  <UPageCard
    data-entity-create-family="ecosystem"
    title="Create an Ecosystem"
    description="Start an Ecosystem from the Project workspace."
    orientation="horizontal"
    variant="naked"
  >
    <template #footer>
      <UButton
        to="/workspace/project/ecosystem"
        icon="i-lucide-orbit"
        color="primary"
      >
        Create Ecosystem
      </UButton>
    </template>
  </UPageCard>
</template>
