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
