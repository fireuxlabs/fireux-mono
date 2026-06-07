<template>
  <div
    class="inline-flex shrink-0 flex-col items-center justify-center shadow-sm ring-1 ring-default"
    style="width: 72px; height: 72px; border-radius: 16px; padding: 7px; background: #ffffff; color: #111827;"
  >
    <div
      class="grid place-items-center bg-[#111827]"
      style="width: 54px; height: 37px; border-radius: 10px; padding: 4px;"
    >
      <img
        v-if="logo"
        :src="logo"
        alt=""
        class="object-contain"
        style="max-width: 44px; max-height: 28px;"
      />
      <UIcon
        v-else
        name="i-lucide-utensils"
        class="text-white/80"
        style="width: 20px; height: 20px;"
      />
    </div>

    <div
      class="inline-flex max-w-full items-center"
      style="margin-top: 5px; gap: 3px; border-radius: 999px; padding: 3px 5px; background: #111827; color: #ffffff;"
    >
      <span
        class="whitespace-nowrap font-black uppercase"
        style="font-size: 6px; letter-spacing: .06em; color: #ffffff;"
      >
        Food Menu
      </span>
      <UIcon
        name="i-lucide-languages"
        style="width: 9px; height: 9px; color: #ffffff;"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  logo?: string
}>()
</script>
