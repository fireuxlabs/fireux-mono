<template>
  <UButton
    v-if="pending"
    loading
    disabled
    block
    :square="collapsed"
    :label="collapsed ? undefined : `Loading ${workspaceLabel}`"
    :aria-label="`Loading ${workspaceLabel}`"
    color="neutral"
    variant="ghost"
  />
  <UDropdownMenu
    v-else-if="item.choices.length"
    :items="[
      [
        {
          label: `${workspaceLabel} Workspace home`,
          icon: 'i-lucide-house',
          to,
        },
      ],
      item.choices,
    ]"
    :content="{ align: 'center', collisionPadding: 12 }"
  >
    <UButton
      :label="collapsed ? undefined : item.label"
      :icon="item.avatar?.src || item.image ? undefined : item.icon"
      :trailing-icon="collapsed ? undefined : 'i-lucide-chevrons-up-down'"
      color="neutral"
      variant="ghost"
      size="sm"
      block
      :square="collapsed"
      :aria-label="`${item.label}: change ${workspaceLabel}`"
    >
      <template v-if="item.avatar?.src || item.image" #leading>
        <UAvatar
          :src="item.image"
          :alt="item.label"
          v-bind="item.avatar"
          size="2xs"
        />
      </template>
    </UButton>
  </UDropdownMenu>

  <UButton
    v-else
    :to="to"
    :label="collapsed ? undefined : item.label"
    :icon="item.avatar?.src || item.image ? undefined : item.icon"
    color="neutral"
    variant="ghost"
    size="sm"
    block
    :square="collapsed"
    :aria-label="`Open ${item.label}`"
  >
    <template v-if="item.avatar?.src || item.image" #leading>
      <UAvatar
        :src="item.image"
        :alt="item.label"
        v-bind="item.avatar"
        size="2xs"
      />
    </template>
  </UButton>
</template>

<script setup lang="ts">
import type { AvatarProps, DropdownMenuItem } from '@nuxt/ui'

withDefaults(
  defineProps<{
    to?: string
    collapsed: boolean
    pending?: boolean
    workspaceLabel: string
    item: {
      label: string
      description?: string
      image?: string
      avatar?: AvatarProps
      icon?: string
      choices: DropdownMenuItem[]
    }
  }>(),
  { to: '/' }
)
</script>
