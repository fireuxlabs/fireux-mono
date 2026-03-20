# Config Directory

Authority: Operational
Updated: 2026-03-20
Scope: `packages/*/fireux-*/src/config` only.
Does not apply to package-root config files such as `tsconfig.json`.

Learn how `config/` is used as support inside FireUX module packages.

## Config Directory

`config/` is support space inside `src/`.

It exists to help the module spine.
It is not the spine.

## Config Structure

```text
config/
├─ app/
├─ firebase/
├─ module/
└─ nuxt/
```

Not every package needs every config subdirectory.

## app Directory

`app/` is for app-consumer support where a package genuinely exposes app-facing setup helpers.

## firebase Directory

`firebase/` is for ecosystem-specific Firebase support where package scope genuinely requires it.

## module Directory

`module/` is for module wiring helpers used by `module.ts`.

## nuxt Directory

`nuxt/` is a questioned seam for thin Nuxt-specific support.

It is documented here as a possible support idea, not as part of the current aligned live pattern.

## Aligned In Repo

- `config/module/` is the strongest shared config pattern
- `config/firebase/` is a real ecosystem-specific support seam
- `config/app/` is valid, but currently core-specific
- narrower packages already prove that `config/` is optional rather than mandatory

## Not Aligned Yet

- `config/nuxt/` is not currently part of the aligned live repo pattern
- support surfaces still need to stay small enough not to feel like a second system

## Roadmap To Reconciliation

1. Keep `config/` explicitly supportive.
2. Keep `config/module/` as the default config seam.
3. Keep `config/app/` and `config/firebase/` only where package scope clearly justifies them.
4. Do not reintroduce `config/nuxt/` without a clear case.

## Short Version

`config/` is valid support, not a second system.

Use it where setup help is real and keep it smaller than the spine it supports.
