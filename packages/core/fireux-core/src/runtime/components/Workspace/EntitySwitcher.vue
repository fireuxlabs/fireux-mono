<template>
  <UDropdownMenu
    v-if="item.choices.length && collapsed"
    :items="[item.choices]"
    :content="{ align: 'center', collisionPadding: 12 }"
    :ui="{ content: 'w-48' }"
  >
    <UButton
      :icon="item.image ? undefined : item.icon"
      color="neutral"
      variant="ghost"
      size="sm"
      block
      square
      class="data-[state=open]:bg-elevated"
      :aria-label="`Change ${workspaceLabel}`"
    >
      <template v-if="item.image" #leading>
        <UAvatar :src="item.image" :alt="item.label" size="2xs" />
      </template>
    </UButton>
  </UDropdownMenu>

  <div v-else-if="item.choices.length" class="flex w-full items-center">
    <UButton
      :to="item.to"
      :label="item.label"
      :icon="item.image ? undefined : item.icon"
      color="neutral"
      variant="ghost"
      size="sm"
      block
      class="min-w-0 flex-1 justify-start rounded-r-none"
      :aria-label="`Open ${item.label}`"
    >
      <template v-if="item.image" #leading>
        <UAvatar :src="item.image" :alt="item.label" size="2xs" />
      </template>
    </UButton>
    <UDropdownMenu
      :items="[item.choices]"
      :content="{ align: 'end', collisionPadding: 12 }"
      :ui="{ content: 'w-48' }"
    >
      <UButton
        icon="i-lucide-chevrons-up-down"
        color="neutral"
        variant="ghost"
        size="sm"
        square
        class="shrink-0 rounded-l-none data-[state=open]:bg-elevated"
        :ui="{ leadingIcon: 'text-dimmed' }"
        :aria-label="`Change ${workspaceLabel}`"
      />
    </UDropdownMenu>
  </div>

  <UButton
    v-else
    :to="item.to"
    :label="collapsed ? undefined : item.label"
    :icon="item.image ? undefined : item.icon"
    color="neutral"
    variant="ghost"
    size="sm"
    block
    :square="collapsed"
    :aria-label="`Open ${item.label}`"
  >
    <template v-if="item.image" #leading>
      <UAvatar :src="item.image" :alt="item.label" size="2xs" />
    </template>
  </UButton>
</template>

<script setup lang="ts">
import type { DropdownMenuItem } from '@nuxt/ui'

defineProps<{
  collapsed: boolean
  workspaceLabel: string
  item: {
    label: string
    description?: string
    image?: string
    icon?: string
    to?: string
    choices: DropdownMenuItem[]
  }
}>()
</script>
