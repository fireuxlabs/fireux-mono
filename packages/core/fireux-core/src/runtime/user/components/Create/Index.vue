<template>
  <UPageCard
    data-entity-create-family="user"
    title="Current User"
    description="Sign in to view or create your profile."
    orientation="horizontal"
    variant="naked"
  >
    <template #footer>
      <UserCreateSystem />
    </template>
  </UPageCard>
</template>
