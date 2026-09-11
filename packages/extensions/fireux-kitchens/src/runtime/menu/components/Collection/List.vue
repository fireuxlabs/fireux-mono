<template>
  <div class="menu-offerings">
    <article v-for="group in groups" :key="group.id" class="menu-offering">
      <div
        class="menu-offering__media"
        :class="{ 'menu-offering__media--empty': !group.image }"
      >
        <img v-if="group.image" :src="group.image" alt="" loading="lazy" />
        <div v-else class="menu-offering__placeholder">
          <span class="menu-offering__initials" aria-hidden="true">{{
            group.name
              .split(/\s+/)
              .slice(0, 2)
              .map((word) => word[0])
              .join('')
          }}</span>
        </div>
        <img
          v-if="group.logo"
          :src="group.logo"
          alt=""
          class="menu-offering__logo"
          loading="lazy"
        />
      </div>
      <div class="menu-offering__body">
        <h3>{{ group.name }}</h3>
        <p
          v-if="highlight(group)?.description || group.description"
          class="menu-offering__description"
        >
          {{ highlight(group)?.description || group.description }}
        </p>
        <div v-if="highlight(group)" class="menu-offering__promotion">
          <span class="menu-offering__promotion-title"
            ><UIcon name="i-lucide-tag" />{{ highlight(group)?.title }}</span
          >
          <p>{{ highlight(group)?.terms }}</p>
        </div>
        <UButton
          :to="group.to"
          color="neutral"
          variant="outline"
          trailing-icon="i-lucide-arrow-up-right"
          class="menu-offering__action"
          >View offering</UButton
        >
      </div>
    </article>
  </div>
</template>
<script setup lang="ts">
import { computed } from 'vue'
import type { MenuDirectoryEntry } from '../../models/menu-directory.response'
import { groupPublicMenus } from '../../utils/menu-discovery'
import { useAppConfig } from '#imports'
import type { MenuDiscoveryGroup } from '../../utils/menu-discovery'
type Highlight = {
  sourceAppId: string
  kitchenId: string
  description: string
  title: string
  terms: string
}
const props = defineProps<{ menus: MenuDirectoryEntry[] }>()
const groups = computed(() => groupPublicMenus(props.menus))
const appConfig = useAppConfig() as {
  menuDiscovery?: { highlights?: Highlight[] }
}
const highlight = (group: MenuDiscoveryGroup) =>
  appConfig.menuDiscovery?.highlights?.find(
    (item) => group.id === `venue:${item.sourceAppId}:${item.kitchenId}`
  )
</script>
<style scoped>
.menu-offerings {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 1.5rem;
  align-items: stretch;
}
.menu-offering {
  border: 1px solid var(--ui-border);
  border-radius: 1.2rem;
  overflow: hidden;
  background: var(--ui-bg);
  display: flex;
  flex-direction: column;
  box-shadow: 0 3px 12px #00000008;
  transition:
    border-color 0.18s ease,
    box-shadow 0.18s ease;
}
.menu-offering:hover {
  border-color: var(--ui-border-accented);
  box-shadow: 0 8px 24px #00000012;
}
.menu-offering__media {
  position: relative;
  height: 10rem;
  flex-shrink: 0;
  background: var(--ui-bg-elevated);
  overflow: hidden;
}
.menu-offering__media > img:first-child {
  width: 100%;
  height: 100%;
  object-fit: contain;
  padding: 0.75rem;
  background: #f3f1ea;
}
.menu-offering__placeholder {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  gap: 0.85rem;
  color: var(--ui-text-muted);
  background: var(--ui-bg-muted);
}
.menu-offering__placeholder .menu-offering__initials {
  font-size: 3rem;
  font-weight: 650;
  letter-spacing: -0.06em;
  color: var(--ui-primary);
  opacity: 0.6;
}
.menu-offering__placeholder span {
  font-size: 0.75rem;
}
.menu-offering__media img.menu-offering__logo {
  position: absolute;
  bottom: 1rem;
  left: 1rem;
  width: 3rem;
  height: 3rem;
  border: 3px solid var(--ui-bg);
  border-radius: 0.7rem;
  object-fit: contain;
  background: white;
}
.menu-offering__body {
  padding: 1.15rem;
  display: flex;
  flex-direction: column;
  flex: 1;
}
h3 {
  font-size: 1.12rem;
  font-weight: 650;
  line-height: 1.3;
  letter-spacing: -0.025em;
  color: var(--ui-text-highlighted);
  margin: 0;
}
.menu-offering__description {
  color: var(--ui-text-muted);
  font-size: 0.9rem;
  line-height: 1.65;
  margin: 0.6rem 0 1rem;
}
.menu-offering__promotion {
  border: 1px solid color-mix(in srgb, var(--ui-primary) 25%, var(--ui-border));
  border-radius: 0.75rem;
  padding: 0.85rem;
  margin: 1rem 0;
  background: color-mix(in srgb, var(--ui-primary) 7%, var(--ui-bg));
}
.menu-offering__promotion-title {
  display: flex;
  gap: 0.5rem;
  align-items: center;
  color: var(--ui-primary);
  font-size: 0.9rem;
  font-weight: 650;
}
.menu-offering__promotion p {
  font-size: 0.8rem;
  line-height: 1.6;
  margin: 0.5rem 0;
  color: var(--ui-text-muted);
}

.menu-offering__action {
  margin-top: auto;
  min-height: 44px;
  width: 100%;
  justify-content: space-between;
  border-radius: 0.65rem;
}
@media (max-width: 1000px) {
  .menu-offerings {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
@media (max-width: 600px) {
  .menu-offerings {
    grid-template-columns: minmax(0, 1fr);
    gap: 1rem;
  }
  .menu-offering__media {
    height: 8.5rem;
  }
}
@media (prefers-reduced-motion: reduce) {
  .menu-offering {
    transition: none;
  }
}
</style>
