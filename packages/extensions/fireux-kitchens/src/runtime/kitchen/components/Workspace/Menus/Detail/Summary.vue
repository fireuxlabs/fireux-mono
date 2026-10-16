<template>
  <aside v-if="!pending && !error && menu" class="menu-context">
    <section class="menu-context__section">
      <h2 class="menu-context__label">Publication</h2>
      <div class="menu-context__status">
        <UIcon
          :name="
            menu.status === 'published' ? 'i-lucide-globe' : 'i-lucide-eye-off'
          "
        />
        <span>{{
          menu.status === 'published'
            ? menu.audience === 'private_link'
              ? 'Available by private link'
              : 'Publicly listed'
            : menu.status === 'archived'
              ? 'Archived'
              : 'Not published'
        }}</span>
      </div>
      <UButton
        @click="select('publishing')"
        label="Manage publication"
        trailing-icon="i-lucide-arrow-up-right"
        color="neutral"
        variant="outline"
        block
      />
    </section>
    <section class="menu-context__section">
      <h2 class="menu-context__label">Kitchen currency</h2>
      <p class="menu-context__currency">{{ currencyCode || 'Not set' }}</p>
      <UButton
        to="/workspace/kitchen/identity"
        label="Kitchen settings"
        trailing-icon="i-lucide-arrow-up-right"
        color="neutral"
        variant="link"
        class="menu-context__link"
      />
    </section>
    <UAccordion :items="[{ label: 'Record details', slot: 'record' }]">
      <template #record>
        <dl class="menu-facts">
          <div v-for="fact in facts" :key="fact.label">
            <dt>{{ fact.label }}</dt>
            <dd>{{ fact.description }}</dd>
          </div>
        </dl>
      </template>
    </UAccordion>
  </aside>
</template>
<script setup lang="ts">
import { computed } from 'vue'
import { useMenuRecordView } from '../../../../composables/workspace/menus/useMenuRecordView'
import { useKitchenMenuRecordContext } from '../../../../composables/workspace/menus/useKitchenMenuRecordContext'
const { menu, pending, error, currencyCode } = useKitchenMenuRecordContext()
const { select } = useMenuRecordView()
const date = (value: unknown) => {
  const seconds = Number((value as { seconds?: number } | undefined)?.seconds)
  return Number.isFinite(seconds)
    ? new Date(seconds * 1000).toISOString().slice(0, 10)
    : 'Not recorded'
}
const facts = computed(() => [
  { label: 'URL slug', description: menu.value?.slug || '' },
  { label: 'Created', description: date(menu.value?.created?.at) },
  { label: 'Updated', description: date(menu.value?.updated?.at) },
])
</script>

<style scoped>
.menu-context {
  padding: clamp(1rem, 2vw, 1.5rem);
  border-left: 1px solid var(--ui-border);
  background: color-mix(in srgb, var(--ui-bg-elevated) 45%, var(--ui-bg));
  display: flex;
  flex-direction: column;
  gap: calc(var(--spacing) * 4);
  min-width: 0;
}
.menu-context__section {
  display: grid;
  gap: calc(var(--spacing) * 3);
}
.menu-context__label {
  margin: 0;
  font-size: var(--text-sm);
  color: var(--ui-text-muted);
  font-weight: 500;
}
.menu-context__status {
  display: flex;
  align-items: center;
  gap: calc(var(--spacing) * 2);
  color: var(--ui-text-highlighted);
  font-size: var(--text-sm);
}
.menu-context__currency {
  margin: 0;
  color: var(--ui-text-highlighted);
  font-size: var(--text-xl);
  font-weight: 600;
}
.menu-context__link {
  justify-self: start;
  padding: 0;
}
.menu-facts {
  display: grid;
  gap: calc(var(--spacing) * 3);
  padding-bottom: calc(var(--spacing) * 2);
  font-size: var(--text-sm);
}
.menu-facts > div {
  display: flex;
  justify-content: space-between;
  gap: calc(var(--spacing) * 3);
}
.menu-facts dt {
  color: var(--ui-text-muted);
}
.menu-facts dd {
  margin: 0;
  text-align: right;
  overflow-wrap: anywhere;
}
@media (max-width: 700px) {
  .menu-context {
    border-left: 0;
    border-top: 1px solid var(--ui-border);
  }
}
</style>
