<!-- Concurrent edit — 2026-07-22 12:20 CEST — Product Demo pass: let embedded Menu presentations suppress route-owned exit chrome. -->
<template>
  <header
    class="menu-identity"
    :data-menu-identity="identityKind"
  >
    <div class="menu-identity__copy">
      <MenuClose
        v-if="showExit && !isKioskMenu"
        class="menu-identity__close"
        :aria-label="exitLabel"
        :kind="exitKind"
        :to="exitPath"
      />

      <div
        v-if="activeAsset"
        class="menu-identity__asset"
        :class="assetClassName"
        :data-menu-identity-asset="activeAsset.kind"
      >
        <img
          :key="activeAsset.url"
          :src="activeAsset.url"
          alt=""
          decoding="async"
          @error="useNextAsset"
        >
      </div>

      <p v-if="kitchenName" class="menu-identity__kitchen">
        <UIcon name="i-lucide-map-pin" aria-hidden="true" />
        {{ kitchenName }}
      </p>

      <h1 :id="headingId">
        {{ menuName }}
      </h1>

      <p v-if="description" class="menu-identity__description">
        {{ description }}
      </p>

      <div
        v-if="showCurrency && currencyCode"
        class="menu-identity__currency"
        aria-label="`Prices in ${currencyCode}`"
      >
        <span>Prices</span>
        <strong>{{ currencyCode }}</strong>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useMenuExit } from '../../composables/fireux/menu/useMenuExit'

type IdentityAssetKind = 'wordmark' | 'logo' | 'image'

type IdentityAsset = {
  kind: IdentityAssetKind
  url: string
}

const props = withDefaults(defineProps<{
  identityKind?: 'menu' | 'kitchen-menu'
  headingId?: string
  kitchenName?: string
  menuName: string
  description?: string
  currencyCode?: string
  showCurrency?: boolean
  imageShade?: 'light' | 'dark' | 'none'
  imageUrl?: string
  logoImageUrl?: string
  showExit?: boolean
  wordmarkImageUrl?: string
}>(), {
  identityKind: 'kitchen-menu',
  headingId: 'menu-title',
  kitchenName: '',
  description: '',
  currencyCode: '',
  showCurrency: true,
  imageShade: 'none',
  imageUrl: '',
  logoImageUrl: '',
  showExit: true,
  wordmarkImageUrl: '',
})
const {
  exitKind,
  exitLabel,
  exitPath,
  isKioskMenu,
} = useMenuExit()

const assetIndex = ref(0)
const assets = computed<IdentityAsset[]>(() => {
  const seen = new Set<string>()

  return [
    { kind: 'wordmark' as const, url: props.wordmarkImageUrl.trim() },
    { kind: 'logo' as const, url: props.logoImageUrl.trim() },
    { kind: 'image' as const, url: props.imageUrl.trim() },
  ].filter((asset) => {
    if (!asset.url || seen.has(asset.url)) return false
    seen.add(asset.url)
    return true
  })
})
const activeAsset = computed(() => assets.value[assetIndex.value] || null)
const assetClassName = computed(() => {
  if (!activeAsset.value) return ''

  const classes = [`menu-identity__asset--${activeAsset.value.kind}`]
  if (activeAsset.value.kind === 'image' && props.imageShade !== 'none') {
    classes.push(`menu-identity__asset--shade-${props.imageShade}`)
  }

  return classes
})

watch(
  () => [props.wordmarkImageUrl, props.logoImageUrl, props.imageUrl],
  () => {
    assetIndex.value = 0
  }
)

function useNextAsset() {
  assetIndex.value += 1
}
</script>

<style scoped>
.menu-identity {
  box-sizing: border-box;
  display: grid;
  justify-items: center;
  width: min(100%, 52rem);
  min-width: 0;
  margin: 0 auto;
  text-align: center;
}

.menu-identity__asset {
  display: grid;
  place-items: center;
  max-width: 100%;
  margin-bottom: 0.65rem;
  overflow: hidden;
}

.menu-identity__asset img {
  display: block;
  max-width: 100%;
}

.menu-identity__asset--wordmark {
  width: min(100%, 24rem);
  min-height: 3rem;
}

.menu-identity__asset--wordmark img {
  width: auto;
  max-height: 4.5rem;
  object-fit: contain;
}

.menu-identity__asset--logo,
.menu-identity__asset--image {
  width: 4.5rem;
  height: 4.5rem;
  border: 1px solid color-mix(in srgb, var(--menu-text) 14%, transparent);
  background: color-mix(in srgb, var(--menu-text) 5%, var(--menu-bg));
}

.menu-identity__asset--logo {
  padding: 0.4rem;
  border-radius: var(--menu-radius);
}

.menu-identity__asset--logo img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.menu-identity__asset--image {
  border-radius: 50%;
}

.menu-identity__asset--shade-light {
  background: #111827;
}

.menu-identity__asset--shade-dark {
  background: #fff;
}

.menu-identity__asset--image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.menu-identity__copy {
  position: relative;
  display: grid;
  justify-items: center;
  width: 100%;
  min-width: 0;
  padding: clamp(calc(var(--spacing) * 5), 3vw, calc(var(--spacing) * 7));
  border: 1px solid color-mix(in srgb, var(--menu-text) 13%, transparent);
  border-radius: var(--menu-radius);
  background: color-mix(in srgb, var(--menu-secondary) 4%, var(--menu-bg));
}

.menu-identity__close {
  --menu-close-size: 2.75rem;
  --menu-close-icon-size: 1.4rem;

  position: absolute;
  z-index: 2;
  top: 0.75rem;
  right: 0.75rem;
}

.menu-identity__kitchen {
  display: inline-flex;
  gap: 0.4rem;
  align-items: center;
  max-width: 100%;
  margin: 0;
  padding: 0.3rem 0.55rem;
  border: 1px solid color-mix(in srgb, var(--menu-secondary) 24%, transparent);
  border-radius: 9999px;
  color: var(--menu-secondary);
  font-size: 0.72rem;
  font-weight: var(--font-weight-extrabold);
  overflow-wrap: anywhere;
}

.menu-identity__kitchen :deep(.iconify) {
  flex: 0 0 auto;
}

.menu-identity h1 {
  max-width: 14ch;
  margin: 0.6rem 0 0;
  color: var(--menu-title);
  font-family: var(--menu-title-font);
  font-size: clamp(2rem, 6vw, var(--text-6xl));
  font-weight: var(--font-weight-extrabold);
  letter-spacing: -0.04em;
  line-height: 1;
  overflow-wrap: anywhere;
  text-wrap: balance;
}

.menu-identity__description {
  max-width: 36rem;
  margin: 0.65rem auto 0;
  color: var(--menu-muted);
  font-size: clamp(0.9rem, 1.8vw, var(--text-base));
  line-height: 1.45;
  white-space: pre-line;
}

.menu-identity__currency {
  display: inline-flex;
  gap: 0.45rem;
  align-items: center;
  margin-top: 0.85rem;
  padding: 0.3rem 0.55rem;
  border-radius: 9999px;
  background: color-mix(in srgb, var(--menu-primary) 10%, var(--menu-bg));
  color: var(--menu-muted);
  font-size: 0.72rem;
  font-weight: var(--font-weight-extrabold);
}

.menu-identity__currency strong {
  color: var(--menu-primary);
  font-size: 0.76rem;
  letter-spacing: var(--tracking-wider);
}

@media (max-width: 35rem) {
  .menu-identity__asset--wordmark {
    width: min(calc(100% - 5rem), 14rem);
  }

  .menu-identity__asset--logo,
  .menu-identity__asset--image {
    width: 4rem;
    height: 4rem;
  }

  .menu-identity__copy {
    padding: calc(var(--spacing) * 5) calc(var(--spacing) * 4);
  }
}
</style>
