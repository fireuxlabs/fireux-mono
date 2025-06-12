<template>
  <UChip v-if="appUser?.avatar" inset @click="navigate">
    <UAvatar :src="proxiedAvatarUrl" :alt="appUser.display_name" size="lg" />
  </UChip>
</template>

<script setup>
import { useAvatarProxy } from '../../../composables/utils/useAvatarProxy'

const router = useRouter()
const { appUser } = useAppUser()
const { getProxiedAvatarUrl } = useAvatarProxy()

// Use proxied avatar URL to bypass CORS issues with Google images
const proxiedAvatarUrl = computed(() =>
  getProxiedAvatarUrl(appUser.value?.avatar)
)

const navigate = () => {
  if (appUser.value?.avatar) {
    router.push('/dashboard')
  } else {
    router.push('/auth')
  }
}
</script>
