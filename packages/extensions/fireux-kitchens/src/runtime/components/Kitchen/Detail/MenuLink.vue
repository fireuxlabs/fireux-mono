<template>
  <article class="kitchen-menu-link">
    <div class="kitchen-menu-link__content">
      <div class="kitchen-menu-link__icon" aria-hidden="true">
        <UIcon name="i-lucide-book-open-text" />
      </div>

      <div class="kitchen-menu-link__copy">
        <div class="kitchen-menu-link__heading">
          <h3>
            {{ menuName }}
          </h3>

          <ClientOnly>
            <UBadge
              v-if="menuServiceChip.known"
              :color="menuServiceChip.color"
              variant="soft"
            >
              {{ menuServiceChip.label }}
            </UBadge>
          </ClientOnly>
        </div>
        <p
          v-if="menuDescription"
          class="kitchen-menu-link__description"
        >
          {{ menuDescription }}
        </p>
      </div>
    </div>

    <div class="kitchen-menu-link__actions">
      <UButton
        v-for="entry in entries"
        :key="entry.to"
        :to="entry.to"
        :icon="entry.icon"
        :color="entry.primary ? 'primary' : 'neutral'"
        :variant="entry.primary ? 'solid' : 'soft'"
        size="md"
      >
        {{ entry.label }}
      </UButton>
    </div>
  </article>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Menu } from '../../../models/kitchen/menu/menu.model'
import { useMenuComputed } from '../../../composables/fireux/firestore/menu/useMenu'

const props = defineProps<{
  entries: Array<{
    label: string
    to: string
    icon: string
    primary?: boolean
  }>
  menu: Menu
}>()

const { menuServiceChip } = useMenuComputed(
  computed(() => props.menu),
  computed(() => false)
)
const text = (value: unknown) => String(value ?? '').trim()
const menuName = computed(() => text(props.menu.name))
const menuDescription = computed(() => text(props.menu.description))
</script>

<style scoped>
.kitchen-menu-link {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: clamp(1.25rem, 3vw, 2rem);
  align-items: center;
  min-height: 10rem;
  padding: clamp(1.25rem, 3vw, 1.75rem);
  border: 1px solid var(--ui-border);
  border-radius: 1.25rem;
  background:
    radial-gradient(
      circle at 100% 0%,
      color-mix(in srgb, var(--ui-primary) 10%, transparent),
      transparent 42%
    ),
    var(--ui-bg-elevated);
  box-shadow: 0 0.75rem 2rem rgb(0 0 0 / 6%);
  transition:
    border-color 160ms ease,
    box-shadow 160ms ease,
    transform 160ms ease;
}

.kitchen-menu-link:hover {
  border-color: color-mix(in srgb, var(--ui-primary) 36%, var(--ui-border));
  box-shadow: 0 1rem 2.5rem rgb(0 0 0 / 9%);
  transform: translateY(-2px);
}

.kitchen-menu-link__content {
  display: flex;
  min-width: 0;
  align-items: flex-start;
  gap: 1rem;
}

.kitchen-menu-link__icon {
  display: grid;
  flex: 0 0 auto;
  width: 2.75rem;
  height: 2.75rem;
  place-items: center;
  border-radius: 0.9rem;
  background: color-mix(in srgb, var(--ui-primary) 14%, transparent);
  color: var(--ui-primary);
}

.kitchen-menu-link__icon :deep(svg) {
  width: 1.25rem;
  height: 1.25rem;
}

.kitchen-menu-link__copy {
  min-width: 0;
}

.kitchen-menu-link__heading {
  display: flex;
  flex-wrap: wrap;
  gap: 0.55rem;
  align-items: center;
}

.kitchen-menu-link h3 {
  margin: 0;
  color: var(--ui-text-highlighted);
  font-size: clamp(1.1rem, 2vw, 1.35rem);
  font-weight: 700;
  letter-spacing: -0.015em;
}

.kitchen-menu-link__description {
  max-width: 58ch;
  margin: 0.55rem 0 0;
  color: var(--ui-text-muted);
  font-size: 0.9rem;
  line-height: 1.55;
}

.kitchen-menu-link__actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 0.6rem;
}

@media (max-width: 44rem) {
  .kitchen-menu-link {
    grid-template-columns: 1fr;
  }

  .kitchen-menu-link__actions {
    justify-content: flex-start;
  }

  .kitchen-menu-link__actions :deep(a) {
    flex: 1 1 auto;
  }
}
</style>
