<template>
  <section
    v-if="isLoading || adminCards.length"
    class="footer-admins"
    aria-labelledby="footer-admins-title"
  >
    <div class="footer-admins__header">
      <p id="footer-admins-title" class="footer-admins__label">Admin team</p>
    </div>

    <div v-if="isLoading" class="footer-admins__loading">
      <USkeleton v-for="n in 2" :key="n" class="footer-admins__skeleton" />
    </div>

    <div v-else-if="adminCards.length" class="footer-admins__grid">
      <OrganismsUserCardsPill
        v-for="admin in adminCards"
        :key="admin.key"
        v-bind="admin.card"
        :link="Boolean(admin.card.to)"
        :show-badges="false"
        class="block"
      />
    </div>

    <p v-else class="footer-admins__empty">No admins assigned yet.</p>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useAppUsers } from '../../../composables/fireux/firestore/core/app/fetch/useAppUsers'
import { useUserCollection } from '../../../composables/fireux/firestore/core/user/fetch/useUserCollection'
import type { UserCard } from '../../../composables/fireux/firestore/core/user/utils/view/useUserInterface'
import { useUserInterface } from '../../../composables/fireux/firestore/core/user/utils/view/useUserInterface'
const { pending } = useAppUsers()
const { fulfilled } = useUserCollection()
const { card } = useUserInterface()

const adminEntries = computed(() =>
  (fulfilled?.value ?? []).filter(
    (entry) => entry.appUser?.role?.trim().toLowerCase() === 'admin'
  )
)

const adminCards = computed(() => {
  const entries = adminEntries.value
  const result: Array<{ key: string; card: UserCard.Card }> = []

  entries.forEach((record, index) => {
    const payload = card(record as any)
    if (!payload) return

    result.push({
      key: record.id || `${index}`,
      card: {
        ...payload,
        displayName: payload.displayName,
        badges: [],
        profiles: [],
      },
    })
  })

  return result
})

const isLoading = computed(() => Boolean(pending.value))

</script>

<style scoped>
.footer-admins {
  width: 100%;
  border-top: 1px solid var(--ui-border-200, rgba(148, 163, 184, 0.3));
  padding-top: 1.5rem;
}

.footer-admins__header {
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
  margin-bottom: 0.75rem;
}

.footer-admins__label {
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--ui-text-500, rgba(100, 116, 139, 1));
}

.footer-admins__context {
  font-size: 0.85rem;
  color: var(--ui-text-400, rgba(100, 116, 139, 0.9));
}

.footer-admins__grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 0.75rem;
  width: 100%;
}

.footer-admins__loading {
  display: grid;
  gap: 0.5rem;
}

.footer-admins__skeleton {
  height: 3.5rem;
  border-radius: 0.75rem;
}

.footer-admins__empty {
  font-size: 0.85rem;
  color: var(--ui-text-400, rgba(100, 116, 139, 0.9));
}
</style>
