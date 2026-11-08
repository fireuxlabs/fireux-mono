<template>
  <UCard class="profile">
    <template #header>
      <UserCardsCell
        v-bind="view"
        :display-name="user.display_name"
        :bio="user.bio"
        :show-subtitle="showSubtitle"
        :show-tagline="false"
      />
    </template>
    <div class="profile__body">
      <section v-if="showDescription && user.bio" class="profile__section">
        <div class="profile__label">About</div>
        <div class="profile__value">{{ user.bio }}</div>
      </section>
      <section v-if="showDetails" class="profile__section">
        <div class="profile__label">Details</div>
        <div class="profile__value">
          <div class="profile__kv">
            <div class="profile__k">User id</div>
            <div class="profile__v">{{ user.id }}</div>
          </div>
        </div>
      </section>
    </div>
    <template v-if="showFooter" #footer>
      <UserCardsPill
        v-bind="view"
        :display-name="user.display_name"
        :show-subtitle="showSubtitle"
      />
    </template>
  </UCard>
</template>
<script setup lang="ts">
import { computed } from 'vue'
import type { User } from '../models/user.model'
import { useUserView } from '../composables/useUserView'
const props = withDefaults(
  defineProps<{
    user: User
    showSubtitle?: boolean
    showDescription?: boolean
    showDetails?: boolean
    showFooter?: boolean
  }>(),
  {
    showSubtitle: true,
    showDescription: true,
    showDetails: true,
    showFooter: true,
  }
)
const { toView } = useUserView()
const view = computed(() => toView(props.user))
</script>
