<template>
  <div
    class="qr-centre-mark"
  >
    <div
      class="qr-centre-mark__logo"
    >
      <img
        v-if="logo"
        :src="logo"
        alt=""
        class="qr-centre-mark__logo-image"
      />
      <UIcon
        v-if="!logo && !displayLabel"
        name="i-lucide-utensils"
        class="qr-centre-mark__logo-icon"
      />
      <span
        v-else-if="!logo"
        class="qr-centre-mark__fallback"
      >
        {{ displayLabel }}
      </span>
    </div>

    <div
      class="qr-centre-mark__chip"
    >
      <span
        class="qr-centre-mark__label"
      >
        Food menu
      </span>
      <UIcon
        name="i-lucide-languages"
        class="qr-centre-mark__language"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  label?: string
  logo?: string
}>()

const clean = (value: unknown) => String(value ?? '').trim()
const displayLabel = computed(() => {
  const words = clean(props.label).split(/\s+/).filter(Boolean)
  const primaryWord = words.find((word) => word.length > 2) ?? words[0] ?? ''

  return primaryWord.slice(0, 5).toUpperCase()
})
</script>

<style scoped>
.qr-centre-mark {
  display: inline-flex;
  width: 78px;
  height: 78px;
  flex-shrink: 0;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 7px;
  border-radius: 18px;
  background: #ffffff;
  color: #111827;
  box-shadow: 0 1px 2px rgb(15 23 42 / 10%);
}

.qr-centre-mark__logo {
  display: grid;
  width: 60px;
  height: 42px;
  place-items: center;
  padding: 5px;
  border-radius: 12px;
  background: #111827;
}

.qr-centre-mark__logo-image {
  max-width: 50px;
  max-height: 31px;
  object-fit: contain;
}

.qr-centre-mark__logo-icon {
  width: 22px;
  height: 22px;
  color: rgb(255 255 255 / 86%);
}

.qr-centre-mark__fallback {
  color: #ffffff;
  font-size: 12px;
  font-weight: 950;
  letter-spacing: 0.08em;
  line-height: 1;
  text-transform: uppercase;
}

.qr-centre-mark__chip {
  display: inline-flex;
  max-width: 100%;
  align-items: center;
  gap: 4px;
  margin-top: 5px;
  padding: 3px 6px;
  border-radius: 999px;
  background: #111827;
  color: #ffffff;
}

.qr-centre-mark__label {
  color: #ffffff;
  font-size: 6px;
  font-weight: 900;
  letter-spacing: 0.06em;
  line-height: 1;
  text-transform: uppercase;
  white-space: nowrap;
}

.qr-centre-mark__language {
  width: 9px;
  height: 9px;
  color: #ffffff;
}
</style>
