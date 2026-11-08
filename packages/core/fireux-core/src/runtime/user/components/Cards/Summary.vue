<template>
  <UCard class="preview">
    <div class="preview__row">
      <UAvatar
        :src="avatarUrl || USER_ECOSYSTEM_AVATAR_SRC"
        :alt="displayName"
        size="sm"
      />

      <div class="preview__main">
        <div class="preview__top">
          <div class="preview__title">{{ displayName }}</div>
        </div>

        <div v-if="showSubtitle && handleLabel" class="preview__subtitle">
          {{ handleLabel }}
        </div>

        <div v-if="showBody && bio" class="preview__body">
          <div class="preview__line">{{ bio }}</div>
        </div>
      </div>
    </div>
  </UCard>
</template>

<script setup lang="ts">
import { USER_ECOSYSTEM_AVATAR_SRC } from '../../utils/user-avatar'

type Props = {
  avatarUrl?: string
  displayName?: string
  handleLabel?: string
  bio?: string

  showSubtitle?: boolean
  showBody?: boolean
}

withDefaults(defineProps<Props>(), {
  avatarUrl: '',
  displayName: '',
  handleLabel: '',
  bio: '',
  showSubtitle: true,
  showBody: true,
})
</script>
