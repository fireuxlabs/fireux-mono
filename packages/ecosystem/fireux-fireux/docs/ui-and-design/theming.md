---
title: Theming
description: How to set up per-app themes (Nuxt UI palettes) without breaking shared core styles.
---

# Theming

FireUX theming is **layered**:

1. **Core design system** (shared)
	 - Provided by the `fireux-core` module.
	 - Loaded via Nuxt `css` from:
		 - `fireux-core/runtime/assets/styles/main.css` (Tailwind + Nuxt UI base)
		 - `fireux-core/runtime/assets/styles/main.scss` (additive SCSS)
2. **App theme** (per app or tenant)
	 - Lives in the app under `app/assets/styles/…`
	- Defines the palette variables for your chosen theme token name.
	 - Is appended after core CSS so it can override/extend tokens.

The key rule: **if you set a custom Nuxt UI primary color name, you must define the palette variables for it.**

## The Failure Mode (Common Gotcha)

If you do this in `app/app.config.ts`:

```ts
export default defineAppConfig({
	ui: {
		colors: {
			primary: 'theme',
			neutral: 'slate',
		},
		safelistColors: ['theme'],
	},
})
```

…but you **don’t** define `--ui-color-theme-*` in app CSS, Nuxt UI will try to style components like:

```vue
<UButton color="primary">Sign in</UButton>
```

…using a palette that doesn’t exist.

In practice, the button can still be present in the DOM (cursor changes, clickable area exists) but appear **invisible** because the color tokens resolve to nothing.

## Step-by-step: Create a Custom Theme

### 1) Choose a palette name

Pick a short, lowercase token.

Two valid patterns:

- **Generic palette name** (recommended for consistency): `theme`
- **App-specific palette name** (also valid): `misebox`, `cleanbox`, etc.

The palette name must match the CSS variable prefix `--ui-color-<name>-*`.

### 2) Configure Nuxt UI to use it

In `app/app.config.ts`:

```ts
import { defineAppConfig } from '#imports'

export default defineAppConfig({
	ui: {
		colors: {
			primary: 'theme',
			neutral: 'slate',
		},
		safelistColors: ['theme'],
	},
})
```

### 3) Define the palette variables

Create (or update) `app/assets/styles/main.css`:

```css
@layer base {
	:root {
		--ui-color-theme-50: #f2f4ec;
		--ui-color-theme-100: #e6e9da;
		--ui-color-theme-200: #d5dac1;
		--ui-color-theme-300: #c4cba9;
		--ui-color-theme-400: #b7c196;
		--ui-color-theme-500: #abb684;
		--ui-color-theme-600: #96a074;
		--ui-color-theme-700: #808863;
		--ui-color-theme-800: #666d4f;
		--ui-color-theme-900: #4d523b;

		/* Optional: convenience bridges */
		--ui-primary: var(--ui-color-theme-500);
		--ui-primary-hover: var(--ui-color-theme-600);
		--ui-primary-active: var(--ui-color-theme-700);
	}
}
```

Notes:

- Keep this file **palette + tokens only**.
- Don’t add `@import 'tailwindcss'` or `@import '@nuxt/ui'` here; core already does that.
- Use `@layer base` so token overrides land in the expected cascade.

### 4) Ensure the app theme CSS is loaded

The shared config (`defineFireuxConfig`) already includes the core CSS.

When you add app-level theme CSS, append it in the app’s `nuxt.config.ts`:

```ts
import { defineNuxtConfig } from 'nuxt/config'
import { defineFireuxConfig } from 'fireux-core/config/app/fireux.config'

const base = defineFireuxConfig({
	ecosystem: 'misebox',
	id: 'misebox-app',
	name: 'Misebox',
	shortName: 'Misebox',
	description: '…',
	role: 'global',
})

export default defineNuxtConfig({
	...base,
	css: [...(base.css ?? []), '@/assets/styles/main.css'],
})
```

## Naming: Will `app/assets/styles/main.css` Clash with Core?

No.

- Core uses `fireux-core/runtime/assets/styles/main.css` and `fireux-core/runtime/assets/styles/main.scss`.
- Apps use `@/assets/styles/main.css` (where `@/` points at the app’s `app/` folder).

They are **different files with different paths**. Nuxt loads both; the only important detail is **order**:

- Core CSS first (from `defineFireuxConfig`)
- App theme CSS last (your palette overrides)

Using the same filename (`main.css`) is intentional and consistent with the repo’s convention; it makes it easy to remember “core main.css” vs “app main.css”.

## Quick checklist

- `app/app.config.ts` sets `ui.colors.primary` to a real palette name
- `app/assets/styles/main.css` defines `--ui-color-<name>-50…900`
- `nuxt.config.ts` appends `@/assets/styles/main.css` after core css
- After changing `nuxt.config.ts` `css`, restart dev server
