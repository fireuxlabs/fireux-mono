<template>
  <div class="step-content">
    <p class="asset-help">
      All assets should be on transparent backgrounds. Preferred formats:
      PNG for raster, SVG for vector. If you only have JPG, we can convert.
    </p>
    <div class="assets-grid">
      <div class="asset-card">
        <p class="asset-label">Logo</p>
        <MoleculesFormsStateImagePicker
          label=""
          state-key="onboardingAssetLogo"
        />
        <p class="asset-meta">SVG preferred, PNG ok. Opaque artwork, transparent background.</p>
      </div>
      <div class="asset-card">
        <p class="asset-label">Wordmark (Light)</p>
        <MoleculesFormsStateImagePicker
          label=""
          state-key="onboardingAssetWordmarkLight"
        />
        <p class="asset-meta">SVG preferred, PNG ok. Opaque artwork, transparent background.</p>
      </div>
      <div class="asset-card">
        <p class="asset-label">Wordmark (Dark)</p>
        <MoleculesFormsStateImagePicker
          label=""
          state-key="onboardingAssetWordmarkDark"
        />
        <p class="asset-meta">SVG preferred, PNG ok. Opaque artwork, transparent background.</p>
      </div>
      <div class="asset-card">
        <p class="asset-label">Cover Image</p>
        <MoleculesFormsStateImagePicker
          label=""
          state-key="onboardingAssetCover"
        />
        <p class="asset-meta">PNG 1600x900+. Opaque artwork, transparent background.</p>
      </div>
      <div class="asset-card">
        <p class="asset-label">Thumbnail</p>
        <MoleculesFormsStateImagePicker
          label=""
          state-key="onboardingAssetThumbnail"
        />
        <p class="asset-meta">PNG 1200x1200. Opaque artwork, transparent background.</p>
      </div>
      <div class="asset-card">
        <p class="asset-label">PWA Icon 192</p>
        <MoleculesFormsStateImagePicker
          label=""
          state-key="onboardingAssetPwa192"
        />
        <p class="asset-meta">PNG 192x192. Opaque artwork, transparent background.</p>
      </div>
      <div class="asset-card">
        <p class="asset-label">PWA Icon 512</p>
        <MoleculesFormsStateImagePicker
          label=""
          state-key="onboardingAssetPwa512"
        />
        <p class="asset-meta">PNG 512x512. Opaque artwork, transparent background.</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.step-content {
  margin-top: 1rem;
  padding-bottom: 1.5rem;
}

.asset-help {
  color: #6b7280;
  margin-bottom: 1rem;
}

.assets-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 1rem;
}

.asset-card {
  padding: 1rem;
  border: 1px solid var(--ui-border);
  border-radius: var(--radius-md);
  background: var(--ui-bg);
}

.asset-label {
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.asset-meta {
  margin-top: 0.5rem;
  color: #6b7280;
  font-size: 0.85rem;
}
</style>
