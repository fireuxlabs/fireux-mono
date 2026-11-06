<template>
  <div
    v-if="pending"
    class="flex h-8 items-center gap-2 px-2"
    :aria-label="`Loading ${workspaceLabel}`"
    role="status"
  >
    <USkeleton class="size-5 shrink-0" />
    <USkeleton v-if="!collapsed" class="h-4 flex-1" />
  </div>
  <UDropdownMenu
    v-else-if="item.choices.length && collapsed"
    :items="[item.choices]"
    :content="{ align: 'center', collisionPadding: 12 }"
  >
    <UButton
      :icon="item.avatar?.src || item.image ? undefined : item.icon"
      color="neutral"
      variant="ghost"
      size="sm"
      block
      square
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

  <div v-else-if="item.choices.length" class="flex w-full items-center">
    <UButton
      :to="to"
      :label="item.label"
      :icon="item.avatar?.src || item.image ? undefined : item.icon"
      color="neutral"
      variant="ghost"
      size="sm"
      block
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
    <UDropdownMenu
      :items="[item.choices]"
      :content="{ align: 'end', collisionPadding: 12 }"
    >
      <UButton
        icon="i-lucide-chevrons-up-down"
        color="neutral"
        variant="ghost"
        size="sm"
        square
        :aria-label="`Change ${workspaceLabel}`"
      />
    </UDropdownMenu>
  </div>

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
