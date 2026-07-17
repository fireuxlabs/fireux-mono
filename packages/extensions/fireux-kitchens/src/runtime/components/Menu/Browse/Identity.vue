<template>
  <header
    class="menu-browse-identity"
    :data-menu-identity="identityKind"
  >
    <div
      v-if="activeAsset"
      class="menu-browse-identity__asset"
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

    <div class="menu-browse-identity__copy">
      <p v-if="kitchenName" class="menu-browse-identity__kitchen">
        {{ kitchenName }}
      </p>

      <h1 id="menu-browse-title">
        {{ menuName }}
      </h1>

      <p v-if="description" class="menu-browse-identity__description">
        {{ description }}
      </p>

      <p v-if="currencyCode" class="menu-browse-identity__currency">
        Prices in {{ currencyCode }}
      </p>
    </div>
  </header>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'

type IdentityAssetKind = 'wordmark' | 'logo' | 'image'

type IdentityAsset = {
  kind: IdentityAssetKind
  url: string
}

const props = withDefaults(defineProps<{
  identityKind?: 'menu' | 'kitchen-menu'
  kitchenName?: string
  menuName: string
  description?: string
  currencyCode?: string
  imageShade?: 'light' | 'dark' | 'none'
  imageUrl?: string
  logoImageUrl?: string
  wordmarkImageUrl?: string
}>(), {
  identityKind: 'kitchen-menu',
  kitchenName: '',
  description: '',
  currencyCode: '',
  imageShade: 'none',
  imageUrl: '',
  logoImageUrl: '',
  wordmarkImageUrl: '',
})

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

  const classes = [`menu-browse-identity__asset--${activeAsset.value.kind}`]
  if (activeAsset.value.kind === 'image' && props.imageShade !== 'none') {
    classes.push(`menu-browse-identity__asset--shade-${props.imageShade}`)
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
.menu-browse-identity {
  box-sizing: border-box;
  display: grid;
  gap: 1rem;
  justify-items: center;
  width: min(100%, 48rem);
  min-width: 0;
  margin: 0 auto;
  text-align: center;
}

.menu-browse-identity__asset {
  display: grid;
  place-items: center;
  max-width: 100%;
  overflow: hidden;
}

.menu-browse-identity__asset img {
  display: block;
  max-width: 100%;
}

.menu-browse-identity__asset--wordmark {
  width: min(100%, 24rem);
  min-height: 3rem;
}

.menu-browse-identity__asset--wordmark img {
  width: auto;
  max-height: 5.5rem;
  object-fit: contain;
}

.menu-browse-identity__asset--logo,
.menu-browse-identity__asset--image {
  width: 5.5rem;
  height: 5.5rem;
  border: 1px solid color-mix(in srgb, var(--menu-text) 14%, transparent);
  background: color-mix(in srgb, var(--menu-text) 5%, var(--menu-bg));
}

.menu-browse-identity__asset--logo {
  padding: 0.4rem;
  border-radius: var(--menu-radius);
}

.menu-browse-identity__asset--logo img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.menu-browse-identity__asset--image {
  border-radius: 50%;
}

.menu-browse-identity__asset--shade-light {
  background: #111827;
}

.menu-browse-identity__asset--shade-dark {
  background: #fff;
}

.menu-browse-identity__asset--image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.menu-browse-identity__copy {
  display: grid;
  justify-items: center;
  min-width: 0;
}

.menu-browse-identity__kitchen,
.menu-browse-identity__currency {
  margin: 0;
  color: var(--menu-muted);
  font-size: 0.75rem;
  font-weight: 800;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.menu-browse-identity__kitchen {
  max-width: 100%;
  overflow-wrap: anywhere;
}

.menu-browse-identity h1 {
  margin: 0.45rem 0 0;
  color: var(--menu-title);
  font-family: var(--menu-title-font);
  font-size: clamp(2.35rem, 8vw, 5rem);
  font-weight: 800;
  letter-spacing: -0.04em;
  line-height: 0.98;
  overflow-wrap: anywhere;
}

.menu-browse-identity__description {
  max-width: 42rem;
  margin: 1rem auto 0;
  color: var(--menu-muted);
  font-size: clamp(1rem, 2vw, 1.15rem);
  line-height: 1.6;
  white-space: pre-line;
}

.menu-browse-identity__currency {
  margin-top: 1rem;
  letter-spacing: 0.06em;
}

@media (max-width: 35rem) {
  .menu-browse-identity {
    padding-block-start: var(--menu-browse-identity-top-offset, 0rem);
  }

  .menu-browse-identity__asset--wordmark {
    width: min(100%, 18rem);
  }

  .menu-browse-identity__asset--logo,
  .menu-browse-identity__asset--image {
    width: 4.75rem;
    height: 4.75rem;
  }
}
</style>
