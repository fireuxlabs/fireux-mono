# Theming FireUX Apps

**Status:** Stable  
**Audience:** App developers & designers  
**Scope:** How to give each FireUX app its own color theme while reusing the shared core design system.

---

## 1. Mental Model

Theming in FireUX has **two layers**:

1. **Core design system** (shared)
   - Lives in `packages/core/fireux-core/src/runtime/assets/styles/main.css`
   - Provides layout, typography, spacing, animations, and more
   - Uses Nuxt UI and Tailwind tokens (`@nuxt/ui`, `tailwindcss`)
2. **App theme** (per app or tenant)
   - Lives inside the app, for example `projects/misebox/misebox-app`
   - Defines a named color palette (such as `misebox`) and tells Nuxt UI to use it
   - Can tweak or override core styles if needed

Core is the base. Apps layer their theme on top; nothing in core is deleted.

---

## 2. Where Theming Is Configured

Each app controls its theme in two places:

1. `app/app.config.ts` tells Nuxt UI which color name to use
2. `app/assets/styles/main.css` defines the actual color variables for that name

Example for `projects/misebox/misebox-app`:

- `app/app.config.ts`:

  ```ts
  import { defineAppConfig } from '#imports'

  export default defineAppConfig({
    ui: {
      colors: {
        primary: 'misebox', // custom palette name
        neutral: 'zinc', // keep neutral aligned with core choice
      },
      safelistColors: ['misebox'],
    },
  })
  ```

- `app/assets/styles/main.css`:

  ```css
  @layer base {
    :root {
      /* Misebox primary palette */
      --ui-color-misebox-50: #f2f4ec;
      --ui-color-misebox-100: #e6e9da;
      --ui-color-misebox-200: #d5dac1;
      --ui-color-misebox-300: #c4cba9;
      --ui-color-misebox-400: #b7c196;
      --ui-color-misebox-500: #abb684;
      --ui-color-misebox-600: #96a074;
      --ui-color-misebox-700: #808863;
      --ui-color-misebox-800: #666d4f;
      --ui-color-misebox-900: #4d523b;

      /* Optional: direct bridges for Nuxt UI tokens */
      --ui-primary: var(--ui-color-misebox-500);
      --ui-primary-hover: var(--ui-color-misebox-600);
      --ui-primary-active: var(--ui-color-misebox-700);
    }
  }
  ```

Nuxt UI will:

- Look at `primary: 'misebox'`
- Read `--ui-color-misebox-*` variables
- Use those values for `<UButton color="primary">`, links, and similar components

---

## 3. How App CSS Loads vs Core CSS

Each app's `nuxt.config.ts` starts from a shared FireUX config:

```ts
import { defineNuxtConfig } from 'nuxt/config'
import type { NuxtConfig } from 'nuxt/schema'
import { createFireuxConfig } from 'fireux-core'

const baseConfig = createFireuxConfig({
  appName: 'Misebox',
  appShortName: 'Misebox',
  ecosystem: 'misebox',
  modules: ['fireux-misebox'],
  role: 'global',
  nitro: {
    firebase: {
      serverFunctionName: 'miseboxServer',
    },
  },
})

export default defineNuxtConfig(<NuxtConfig>{
  ...baseConfig,
  css: [...(baseConfig.css ?? []), '@/assets/styles/main.css'],
})
```

Important details:

- `baseConfig.css` already includes the core CSS from `packages/core/fireux-core/src/runtime/assets/styles/main.css`:

  ```css
  @import 'tailwindcss';
  @import '@nuxt/ui';

  @theme static {
    /* spacing, radii, fonts, etc. */
  }

  .page {
    /* layout primitives */
  }
  ```

- `baseConfig.css` also includes an additive SCSS entrypoint: `packages/core/fireux-core/src/runtime/assets/styles/main.scss`
  - Use it for mixins/utility SCSS that should ship with the design system
  - Keep it free of hard-coded colors; prefer existing CSS variables/tokens
  - Requires `sass` available in the consuming workspace/app toolchain

- The app then appends its own `@/assets/styles/main.css` with `css: [...(baseConfig.css ?? []), '@/assets/styles/main.css']`

This means:

- Core CSS always loads first
- App CSS loads after, so it can define extra CSS variables (such as `--ui-color-misebox-*`)
- App CSS can override tokens (`--ui-primary`, etc.)
- App CSS can override shared selectors like `.page { ... }` if required

Theming is additive and layered, not a fork of core.

---

## 4. Creating a New Theme (Step by Step)

To theme a new app (for example, a new tenant):

1. Pick a palette name
   - Choose a short, lowercase name such as `misebox`, `cleanbox`, `tenant1`, or `brandx`
2. Define the palette in `app/assets/styles/main.css`

   ```css
   @layer base {
     :root {
       /* BrandX primary palette */
       --ui-color-brandx-50: #f5f9ff;
       --ui-color-brandx-100: #e0edff;
       --ui-color-brandx-200: #bad4ff;
       --ui-color-brandx-300: #91b8ff;
       --ui-color-brandx-400: #6b9cff;
       --ui-color-brandx-500: #467fff;
       --ui-color-brandx-600: #3564d6;
       --ui-color-brandx-700: #274ba8;
       --ui-color-brandx-800: #1b3578;
       --ui-color-brandx-900: #11234f;

       --ui-primary: var(--ui-color-brandx-500);
       --ui-primary-hover: var(--ui-color-brandx-600);
       --ui-primary-active: var(--ui-color-brandx-700);
     }
   }
   ```

3. Wire the palette into `app/app.config.ts`

   ```ts
   import { defineAppConfig } from '#imports'

   export default defineAppConfig({
     ui: {
       colors: {
         primary: 'brandx', // must match the prefix in --ui-color-brandx-*
         neutral: 'zinc', // keep consistent with core unless you have a reason
       },
       safelistColors: ['brandx'],
     },
   })
   ```

4. Ensure Nuxt loads the app CSS in `nuxt.config.ts`

   ```ts
   export default defineNuxtConfig({
     ...baseConfig,
     css: [...(baseConfig.css ?? []), '@/assets/styles/main.css'],
   })
   ```

5. Verify in the UI
   - Check a `<UButton>` or `<UCard>` that uses `color="primary"`
   - Confirm hover and active states match the palette
   - Check both light and dark mode if relevant

---

## 5. Linking Back to Figma

The Figma theming process mirrors this approach:

1. In the app's Figma file, create a local color style set for the brand (for example `misebox-50` through `misebox-900`)
2. Set the `--ui-primary` equivalent in Figma components to reference the 500 tone of the brand set
3. When exporting assets:
   - Brand imagery follows the rules in `docs/10-core/images.md`
   - Color usage in the app UI matches the CSS palette defined in `app/assets/styles/main.css`

The goal is a single palette that stays in sync across Figma and Nuxt.

---

## 6. Overriding Layout vs Theming

Most of the time you only need colors:

- Define `--ui-color-<brand>-*` in `app/assets/styles/main.css`
- Set `primary: '<brand>'` in `app/app.config.ts`

If you need app-specific layout tweaks (for example, a tighter `.page` max width):

```css
/* In app/assets/styles/main.css */
.page {
  max-width: 960px; /* Overrides core .page max width for this app only */
}
```

Because the app CSS loads after core CSS, these overrides apply only to that app.

---

## 7. Summary

- Core `main.css` is the shared design system and is never themed per app
- App `main.css` holds the brand palette and optional overrides
- `app.config.ts` tells Nuxt UI which palette name to use
- Palette names must match the `--ui-color-<name>-*` variables
- Figma palettes mirror the CSS palette so design and code stay aligned

This pattern lets us ship many branded apps (FireUX, Misebox, Cleanbox, and tenant variants) while maintaining a single core design system and delivering theme overrides with minimal work.
