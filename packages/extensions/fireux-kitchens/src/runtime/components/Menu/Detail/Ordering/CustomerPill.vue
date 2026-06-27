<template>
  <ClientOnly>
    <aside
      v-if="card"
      class="menu-customer-pill"
      aria-label="Signed-in customer"
    >
      <UAvatar
        :src="card.avatarUrl || undefined"
        :text="initials || undefined"
        :alt="card.displayName"
        size="xs"
      />

      <span>
        <strong>{{ card.displayName }}</strong>
        <small>You're signed in</small>
      </span>
    </aside>
  </ClientOnly>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useUserInterface } from 'fireux-core/runtime/composables/fireux/firestore/core/user/useUser'
import { useCustomer } from '../../../../composables/fireux/firestore/profiles/Customer/useCustomer'

const { coreUser } = useCustomer()
const { pill } = useUserInterface()
const card = computed(() => pill(coreUser.value))
const initials = computed(() => {
  const name = String(card.value?.displayName || '').trim()
  if (!name) return ''
  const parts = name.split(/\s+/).filter(Boolean)
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()

  return `${parts[0][0] ?? ''}${parts[1][0] ?? ''}`.toUpperCase()
})
</script>

<style scoped>
.menu-customer-pill {
  display: inline-flex;
  gap: 0.55rem;
  align-items: center;
  width: fit-content;
  max-width: 100%;
  padding: 0.4rem 0.65rem 0.4rem 0.45rem;
  border: 1px solid color-mix(in srgb, var(--menu-text) 14%, transparent);
  border-radius: 999px;
  background: color-mix(in srgb, var(--menu-bg) 80%, transparent);
  color: var(--menu-text);
}

.menu-customer-pill span {
  display: grid;
  min-width: 0;
  line-height: 1.05;
}

.menu-customer-pill strong,
.menu-customer-pill small {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.menu-customer-pill strong {
  color: var(--menu-title);
  font-size: 0.82rem;
  font-weight: 900;
}

.menu-customer-pill small {
  color: var(--menu-muted);
  font-size: 0.68rem;
  font-weight: 800;
}
</style>
