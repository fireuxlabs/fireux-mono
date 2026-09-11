<template>
  <div class="menu-offerings">
    <article v-for="group in groups" :key="group.id" class="menu-offering">
      <div
        class="menu-offering__media"
        :class="{ 'menu-offering__media--empty': !group.image }"
      >
        <img v-if="group.image" :src="group.image" alt="" loading="lazy" />
        <div v-else class="menu-offering__placeholder">
          <UIcon name="i-lucide-utensils" /><span>Take a look at the menu</span>
        </div>
        <img
          v-if="group.logo"
          :src="group.logo"
          alt=""
          class="menu-offering__logo"
          loading="lazy"
        />
        <span class="menu-offering__count"
          >{{ group.menus.length }}
          {{ group.menus.length === 1 ? 'menu' : 'menus' }}</span
        >
      </div>
      <div class="menu-offering__body">
        <h3>{{ group.name }}</h3>
        <div class="menu-offering__menus">
          <NuxtLink
            v-for="menu in group.menus"
            :key="menu.id"
            :to="menuPath(menu.id)"
            class="menu-offering__menu"
          >
            <div class="menu-offering__menu-copy">
              <span class="menu-offering__name"
                >{{ menu.name
                }}<UIcon name="i-lucide-arrow-up-right" aria-hidden="true"
              /></span>
              <p v-if="menu.description && menu.description !== group.name">
                {{ menu.description }}
              </p>
              <span
                v-if="menu.contexts?.length"
                class="menu-offering__services"
                >{{
                  menu.contexts
                    .map(
                      (context) =>
                        serviceLabels[context] || context.replaceAll('_', ' ')
                    )
                    .join(' · ')
                }}</span
              >
              <span v-else class="menu-offering__services">View menu</span>
            </div>
          </NuxtLink>
        </div>
      </div>
    </article>
  </div>
</template>
<script setup lang="ts">
import { computed } from 'vue'
import type { MenuDirectoryEntry } from '../../models/menu-directory.response'
import { groupPublicMenus } from '../../utils/menu-discovery'
import {
  menuRoutePath,
  rootMenuRouteScope,
} from '../../../kitchen/utils/kitchen-menu-route'
const props = defineProps<{ menus: MenuDirectoryEntry[] }>()
const groups = computed(() => groupPublicMenus(props.menus))
const serviceLabels: Record<string, string> = {
  delivery: 'Delivery',
  collection: 'Collection',
  pre_order: 'Pre-order',
  dine_in: 'Table service',
  room_service: 'Room service',
  kiosk: 'Order at venue',
  generic: 'Browse',
}
const menuPath = (menuId: string) =>
  menuRoutePath({ scope: rootMenuRouteScope(), menuId })
</script>
<style scoped>
.menu-offerings {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 1.5rem;
  align-items: start;
}
.menu-offering {
  border: 1px solid var(--ui-border);
  border-radius: 1.2rem;
  overflow: hidden;
  background: var(--ui-bg);
}
.menu-offering__media {
  position: relative;
  height: 12rem;
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
.menu-offering__placeholder > :first-child {
  font-size: 2.3rem;
  color: var(--ui-primary);
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
.menu-offering__count {
  position: absolute;
  top: 0.8rem;
  right: 0.8rem;
  background: var(--ui-bg);
  color: var(--ui-text);
  padding: 0.3rem 0.6rem;
  font-size: 0.7rem;
  font-weight: 600;
  border-radius: 2rem;
}
.menu-offering__body {
  padding: 1.2rem;
}
h3 {
  font-size: 1.2rem;
  font-weight: 650;
  line-height: 1.3;
  letter-spacing: -0.025em;
  color: var(--ui-text-highlighted);
  margin: 0 0 0.8rem;
}
.menu-offering__menus {
  display: grid;
}
.menu-offering__menu {
  padding: 0.8rem 0;
  border-top: 1px solid var(--ui-border);
  display: block;
  border-radius: 0.2rem;
}
.menu-offering__menu:hover .menu-offering__name {
  color: var(--ui-primary);
}
.menu-offering__menu:focus-visible {
  outline: 2px solid var(--ui-primary);
  outline-offset: 4px;
}
.menu-offering__name {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-weight: 600;
  font-size: 0.95rem;
  color: var(--ui-text-highlighted);
  gap: 1rem;
}
.menu-offering__menu p {
  color: var(--ui-text-muted);
  font-size: 0.8rem;
  line-height: 1.5;
  margin: 0.3rem 0;
}
.menu-offering__services {
  display: block;
  font-size: 0.7rem;
  color: var(--ui-text-muted);
  margin-top: 0.4rem;
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
    height: 11rem;
  }
}
</style>
