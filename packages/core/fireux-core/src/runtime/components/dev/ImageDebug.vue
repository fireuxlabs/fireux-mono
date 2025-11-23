<template>
  <section v-if="groups.length" class="dev-image-grid">
    <article v-for="group in groups" :key="group.title" class="dev-image-card">
      <h3 class="dev-image-heading">{{ group.title }}</h3>
      <p v-if="group.description" class="dev-image-copy">
        {{ group.description }}
      </p>
      <ul>
        <li v-for="item in group.items" :key="item.label">
          <div class="dev-image-row">
            <div class="dev-image-preview">
              <div class="dev-image-tile dev-image-tile--light">
                <img :src="item.path" :alt="item.label" />
              </div>
              <div class="dev-image-tile dev-image-tile--dark">
                <img :src="item.path" :alt="item.label" />
              </div>
            </div>
            <div class="dev-image-text">
              <code>{{ item.label }}</code>
              <span class="dev-image-path">{{ item.path }}</span>
            </div>
          </div>
        </li>
      </ul>
    </article>
  </section>
</template>

<script setup lang="ts">
interface DebugImageItem {
  label: string
  path: string
}

interface DebugImageGroup {
  title: string
  description?: string
  items: DebugImageItem[]
}

defineProps<{ groups: DebugImageGroup[] }>()
</script>

<style scoped>
.dev-image-grid {
  margin: 2rem auto;
  display: grid;
  gap: 1.5rem;
  max-width: 720px;
}

.dev-image-card {
  padding: 1rem 1.25rem;
  border-radius: 0.75rem;
  background: var(--ui-bg-soft, rgba(148, 163, 184, 0.1));
  border: 1px dashed rgba(148, 163, 184, 0.5);
}

.dev-image-heading {
  margin-bottom: 0.75rem;
  font-size: 0.95rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.dev-image-copy {
  margin-bottom: 0.75rem;
  font-size: 0.8rem;
  color: rgba(100, 116, 139, 0.85);
}

.dev-image-card ul {
  display: grid;
  gap: 0.5rem;
  font-size: 0.85rem;
  word-break: break-all;
}

.dev-image-row {
  display: flex;
  gap: 0.75rem;
  align-items: center;
}

.dev-image-text {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}

.dev-image-preview {
  display: flex;
  gap: 0.4rem;
}

.dev-image-tile {
  width: 56px;
  height: 56px;
  border-radius: 0.6rem;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.35rem;
  border: 1px solid rgba(148, 163, 184, 0.35);
}

.dev-image-tile img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.dev-image-tile--light {
  background: white;
}

.dev-image-tile--dark {
  background: #0f172a;
}

.dev-image-tile--dark img {
  filter: drop-shadow(0 0 2px rgba(255, 255, 255, 0.6));
}

.dev-image-path {
  font-family: ui-monospace, SFMono-Regular, SFMono, Menlo, Monaco, Consolas,
    'Liberation Mono', 'Courier New', monospace;
  font-size: 0.75rem;
}
</style>
