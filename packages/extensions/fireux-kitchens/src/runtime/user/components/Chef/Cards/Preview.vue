<template>
  <PublicProfileDirectoryCard
    variant="preview"
    kind-label="Chef"
    icon="i-lucide-chef-hat"
    :to="to"
    :avatar-url="avatarUrl"
    :secondary-avatar-url="secondaryAvatarUrl"
    :display-name="displayName"
    :handle="handle"
    :headline="showSubtitle ? title : ''"
    :summary="showBody ? prop || summary : ''"
    :badges="showBadges ? previewBadges : []"
    :link="link"
    :action="action"
    @action="emit('action')"
  />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { ChefCard } from '../../../composables/chef/useChefInterface'

type Props = Partial<
  Pick<
    ChefCard.Card,
    | 'to'
    | 'avatarUrl'
    | 'secondaryAvatarUrl'
    | 'displayName'
    | 'handle'
    | 'title'
    | 'badges'
    | 'summary'
  >
> & {
  action?: boolean
  link?: boolean
  prop?: string
  specialtiesCsv?: string
  showSubtitle?: boolean
  showBadges?: boolean
  showBody?: boolean
}

const emit = defineEmits<{
  (event: 'action'): void
}>()

const props = withDefaults(defineProps<Props>(), {
  action: false,
  avatarUrl: '',
  badges: () => [],
  displayName: '',
  handle: '',
  link: false,
  prop: '',
  secondaryAvatarUrl: '',
  specialtiesCsv: '',
  summary: '',
  title: '',
  showSubtitle: true,
  showBadges: true,
  showBody: true,
})

const previewBadges = computed(() => [
  ...props.badges,
  ...props.specialtiesCsv
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean),
])
</script>
