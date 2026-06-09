<template>
  <div class="allergen-notice">
    <UIcon name="i-lucide-wheat-off" class="size-4 shrink-0" />
    <p>
      If you have a food allergy or intolerance, please speak to a member of the team before ordering.
    </p>
    <UIcon name="i-lucide-wheat-off" class="size-4 shrink-0" />
  </div>
</template>

<style scoped>
.allergen-notice {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  border: 1px solid rgb(253 230 138);
  border-radius: var(--radius-md);
  background: rgb(255 251 235);
  padding: 0.75rem 1rem;
  color: rgb(69 26 3);
  text-align: center;
  font-size: 0.875rem;
  line-height: 1.5;
}

.allergen-notice p {
  margin: 0;
}
</style>
