<template>
  <UChip v-if="appUser?.avatar" inset @click="navigate">
    <UAvatar :src="appUser.avatar" :alt="appUser.display_name" size="lg" />
  </UChip>
</template>

<script setup>
const router = useRouter()
const { appUser } = useAppUser()

const navigate = () => {
  if (appUser.value?.avatar) {
    router.push('/dashboard')
  } else {
    router.push('/auth')
  }
}
</script>