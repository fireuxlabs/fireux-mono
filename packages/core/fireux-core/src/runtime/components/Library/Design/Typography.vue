<template>
  <div class="design">
    <UTabs :items="items" class="custom-tabs">
      <template #roles>
        <h2 class="fx-type-card-title">Semantic Roles</h2>
        <div class="role-grid">
          <div
            v-for="role in semanticRoles"
            :key="role.class"
            class="role-item"
          >
            <p :class="role.class">{{ role.sample }}</p>
            <code class="fx-type-code">{{ role.class }}</code>
          </div>
        </div>
      </template>
    </UTabs>
  </div>
</template>

<script setup lang="ts">
const items = [{ icon: 'i-lucide-book-type', label: 'Roles', slot: 'roles' }]

const semanticRoles = [
  { class: 'fx-type-headline', sample: 'Page or section headline' },
  { class: 'fx-type-display-title', sample: 'Landing display title' },
  { class: 'fx-type-page-title', sample: 'Page title' },
  { class: 'fx-type-section-title', sample: 'Section title' },
  { class: 'fx-type-section-display', sample: 'Marketing section display' },
  { class: 'fx-type-card-title', sample: 'Card title' },
  { class: 'fx-type-card-heading', sample: 'Large card heading' },
  { class: 'fx-type-description', sample: 'Page description copy' },
  { class: 'fx-type-body', sample: 'Body copy for general reading.' },
  { class: 'fx-type-caption', sample: 'Caption and supporting copy' },
  { class: 'fx-type-label', sample: 'Metadata label' },
  { class: 'fx-type-code', sample: 'const role = "code"' },
]
</script>

<style scoped>
.design {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}
h2 {
  text-align: center;
  width: 100%;
  margin-bottom: calc(var(--spacing) * 4);
}
.role-grid {
  display: grid;
  gap: calc(var(--spacing) * 6);
  padding: calc(var(--spacing) * 4);
}
.role-item {
  display: grid;
  gap: calc(var(--spacing) * 2);
  padding-bottom: calc(var(--spacing) * 4);
  border-bottom: 1px solid var(--ui-border);
}
</style>
