<template>
  <client-only>
    <div class="page">
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <UCard>
          <template #default>
            <h2>Metric 1</h2>
            <p>Short text.</p>
          </template>
        </UCard>
        <UCard>
          <template #default>
            <h2>Metric 2</h2>
            <p>A slightly longer placeholder text for analytics or charts.</p>
          </template>
        </UCard>
        <UCard>
          <template #default>
            <h2>Metric 3</h2>
            <p>
              This metric contains a moderate amount of text to see how it
              adjusts.
            </p>
          </template>
        </UCard>
        <UCard>
          <template #default>
            <h2>Metric 4</h2>
            <p>
              This section has a much longer piece of text to observe how it
              wraps inside the grid layout and whether it affects alignment with
              other cards.
            </p>
          </template>
        </UCard>
        <UCard>
          <template #default>
            <h2>Metric 5</h2>
            <p>Very short.</p>
          </template>
        </UCard>
        <UCard>
          <template #default>
            <h2>Metric 6</h2>
            <p>
              This one includes an image to see if media elements break the
              grid.
            </p>
            <img src="https://via.placeholder.com/150" alt="Placeholder" />
          </template>
        </UCard>
        <UCard>
          <template #default>
            <h2>Favorites</h2>
            <p>Placeholder for saved items or favorite products.</p>
          </template>
        </UCard>
        <UCard>
          <template #header>
            <div class="flex items-center gap-2">
              <UIcon name="i-heroicons-user-circle" />
              <span>Account</span>
            </div>
          </template>
          <div>
            <p>{{ appUser?.display_name || appUser?.email }}</p>
            <p class="text-sm text-gray-500 mb-3">ID: {{ appUser?.uid }}</p>
            <UButton
              @click="handleSignOut"
              color="red"
              variant="outline"
              icon="i-heroicons-arrow-right-on-rectangle"
              block
              :loading="isSigningOut"
            >
              Sign Out
            </UButton>
          </div>
        </UCard>
      </div>
    </div>
  </client-only>
</template>

<script setup>
const { appUser } = await useAppUser()
const { signOutUser } = useAuth()
const router = useRouter()

const isSigningOut = ref(false)

const handleSignOut = async () => {
  isSigningOut.value = true
  try {
    await signOutUser()
    await router.push('/auth')
  } catch (error) {
    console.error('Sign out failed:', error)
  } finally {
    isSigningOut.value = false
  }
}

definePageMeta({
  layout: 'dashboard',
  title: 'Dashboard',
  icon: 'i-heroicons-squares-2x2',
})
</script>
