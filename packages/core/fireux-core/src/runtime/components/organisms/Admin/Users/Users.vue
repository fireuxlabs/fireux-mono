<template>
  <div class="admin-users">
    <h2>All Users</h2>
    <ul class="user-list">
      <li v-for="u in users" :key="u.id" class="user-item">
        <NuxtLink :to="`/misebox-users/${u.id}`" class="user-link">
          {{ u.display_name || u.email }}
        </NuxtLink>
        <UBadge v-if="u.isAdmin" color="primary" variant="subtle">Admin</UBadge>
        <UButton
          v-else
          color="primary"
          size="xs"
          variant="soft"
          @click="makeAdmin(u.id)"
        >
          Make Admin
        </UButton>
      </li>
    </ul>
  </div>
</template>

<script setup>
import { collection, getDocs, updateDoc, doc } from 'firebase/firestore'

const db = useFirestore()
const users = ref([])

onMounted(async () => {
  const snapshot = await getDocs(collection(db, 'users'))
  users.value = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
})

async function makeAdmin(userId) {
  try {
    await updateDoc(doc(db, 'users', userId), { isAdmin: true })
    const target = users.value.find(u => u.id === userId)
    if (target) target.isAdmin = true
    console.log(`✅ ${userId} is now an admin.`)
  } catch (error) {
    console.error('Error making user admin:', error)
  }
}
</script>

<style scoped>
.admin-users {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.user-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  padding: 0;
  margin: 0;
  list-style: none;
}

.user-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--space-2);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
}

.user-link {
  font-weight: 500;
  color: var(--text-primary);
  text-decoration: none;
}

.user-link:hover {
  text-decoration: underline;
}
</style>
