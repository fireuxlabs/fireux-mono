<template>
  <UCard
    class="h-full space-y-6 cursor-pointer"
    variant="soft"
    role="button"
    tabindex="0"
    @click="emit('press')"
  >
    <div class="sr-only">Professional card</div>

    <div class="flex items-start gap-5">
      <div
        class="flex-none overflow-hidden rounded-full bg-gray-100"
        style="width: 72px; height: 72px;"
      >
        <img
          v-if="card?.image || card?.avatarUrl"
          :src="card?.image || card?.avatarUrl || undefined"
          :alt="card?.displayName || 'Professional'"
          class="object-cover"
          style="width: 72px; height: 72px;"
        />
        <div
          v-else
          class="flex items-center justify-center text-xs text-dimmed"
          style="width: 72px; height: 72px;"
        >
          {{ card?.displayName?.charAt(0) || 'P' }}
        </div>
      </div>
      <div class="min-w-0 flex flex-col justify-center gap-1 pt-1">
        <div class="text-2xl font-semibold">
          {{ card?.displayName || 'Professional' }}
        </div>
        <div class="text-sm text-dimmed">
          {{ card?.title || 'Professional' }}
        </div>
        <div class="flex items-center gap-1 text-primary pt-1 pb-6">
          <UIcon
            v-for="n in 5"
            :key="n"
            name="i-heroicons-star-20-solid"
            class="h-5 w-5"
          />
        </div>
      </div>
    </div>

    <div class="mx-auto flex flex-col items-center gap-2">
      <div class="rounded-2xl border border-[color:var(--ui-border-subtle)] bg-white p-4">
        <img
          v-if="qrDataUrl"
          :src="qrDataUrl"
          alt="Professional profile QR code"
          class="h-44 w-44"
        />
        <div v-else class="h-44 w-44 animate-pulse rounded-xl bg-gray-100" />
      </div>
    </div>
  </UCard>
</template>

<script setup lang="ts">
import { toDataURL } from 'qrcode';
import { ref, watch } from 'vue';
import type { ProfessionalCard } from '../../../composables/fireux/firestore/profiles/Professional/utils/view/useProfessionalInterface';

defineOptions({ name: 'ProfessionalsCardBusiness' })

const emit = defineEmits<{
  (e: 'press'): void
}>()

const props = defineProps<{
  card?: ProfessionalCard.Card | null
  profileUrl?: string | null
}>()

const qrDataUrl = ref('')

watch(
  () => props.profileUrl,
  async (nextUrl) => {
    if (!import.meta.client) return
    if (!nextUrl) {
      qrDataUrl.value = ''
      return
    }
    try {
      qrDataUrl.value = await toDataURL(nextUrl, {
        width: 320,
        margin: 1,
      })
    } catch {
      qrDataUrl.value = ''
    }
  },
  { immediate: true }
)
</script>
