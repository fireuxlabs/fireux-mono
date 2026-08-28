<template>
  <div class="misebox-handoff-state">
    <USkeleton class="misebox-handoff-state__skeleton" />
  </div>
</template>

<style scoped>
.misebox-handoff-state {
  display: grid;
  min-height: 32rem;
  place-items: center;
}

.misebox-handoff-state__skeleton {
  width: 100%;
  height: 28rem;
  border-radius: calc(var(--ui-radius) * 4);
}
</style>
