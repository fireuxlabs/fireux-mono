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
      <UserCardsPill
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
import { computed, onMounted, ref } from 'vue'
import type { UserCard } from '../../../composables/fireux/firestore/core/user/utils/view/useUserInterface'

type PublicAppAdmin = {
  id: string
  displayName: string
  handle: string
  avatar: string
  profiles: string[]
  unavailable?: boolean
}

const admins = ref<PublicAppAdmin[]>([])
const pending = ref(true)

onMounted(async () => {
  pending.value = true

  try {
    const response = await $fetch<{ admins: PublicAppAdmin[] }>(
      '/api/public/app/admins'
    )
    admins.value = response.admins || []
  } catch (error) {
    if (import.meta.dev) {
      console.warn('[FooterAdmins] failed to load public app admins', error)
    }
    admins.value = []
  } finally {
    pending.value = false
  }
})

const adminCards = computed(() => {
  const entries = admins.value
  const result: Array<{ key: string; card: UserCard.Card }> = []

  entries.forEach((record: PublicAppAdmin, index: number) => {
    const handle = record.handle ? `@${record.handle}` : ''
    const to = record.handle ? `/users/${encodeURIComponent(record.handle)}` : ''

    result.push({
      key: record.id || `${index}`,
      card: {
        id: record.id,
        to,
        imageUrl: record.avatar,
        avatarUrl: record.avatar,
        secondaryAvatarUrl: '',
        displayName: record.displayName,
        title: '',
        subtitle: handle,
        summary: '',
        handle,
        badges: [],
        contactEmail: '',
        contactPhone: '',
        websiteUrl: '',
        bio: '',
        profiles: [],
        appsLabel: '',
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
}

.footer-admins__header {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.15rem;
  margin-bottom: calc(var(--spacing) * 3);
  text-align: center;
}

.footer-admins__label {
  font-size: var(--text-xs);
  font-weight: var(--font-weight-semibold);
  letter-spacing: var(--tracking-widest);
  text-transform: uppercase;
  color: var(--ui-text-toned);
}

.footer-admins__context {
  font-size: var(--text-sm);
  color: var(--ui-text-muted);
}

.footer-admins__grid {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: calc(var(--spacing) * 3);
  width: 100%;
}

.footer-admins__grid > * {
  width: min(100%, 260px);
}

.footer-admins__loading {
  display: grid;
  gap: calc(var(--spacing) * 2);
}

.footer-admins__skeleton {
  height: 3.5rem;
  border-radius: calc(var(--ui-radius) * 3);
}

.footer-admins__empty {
  font-size: var(--text-sm);
  color: var(--ui-text-muted);
}
</style>
