# Core module configuration

Core's [`src/module.ts`](../../module.ts) is its Nuxt module entrypoint. This
directory holds registration and wiring used by Core and other FireUX packages.

- [`module-wiring.ts`](module-wiring.ts) runs module setup steps.
  [`module-helpers.ts`](module-helpers.ts) provides explicit registration for
  components, composables and server handlers.
- [`components-config.ts`](components-config.ts),
  [`assets-config.ts`](assets-config.ts) and [`pages-config.ts`](pages-config.ts)
  supply registration, asset and page policies.
  [`reserved-route-keys.ts`](reserved-route-keys.ts) tracks reserved keys per
  Nuxt instance. [`runtime-config.ts`](runtime-config.ts) applies module-owned
  runtime defaults, as used by [Places](../../../../../extensions/fireux-places/src/config/module/places-config.ts).
- [`runtime-layer.ts`](runtime-layer.ts) checks for a declared native Nuxt layer.
  Apps select layers through `extends`, including Core's
  [native layer](../../runtime/nuxt.config.ts).

Named Ecosystem modules, such as [Misebox](../../../../../ecosystem/fireux-misebox/src/module.ts),
pass their Firebase binding to [`ecosystem-wiring.ts`](ecosystem-wiring.ts).
The helper publishes the binding to runtime config, applies the Ecosystem's
region and optional service account to Nitro, and runs the Ecosystem's supplied
configuration and registration. The App owns its Hosting target.

See the [Ecosystem wiring](../../test/ecosystem-wiring.test.mjs) and
[native-layer](../../test/runtime-layer.test.mjs) checks.
