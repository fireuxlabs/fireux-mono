# Tenants Packages

This folder contains tenant-specific or domain-specific packages for FireUX.

## Packages

- `fireux-cleanbox/`: Cleaning services domain.
- `fireux-misebox/`: Chef/Supplier marketplace domain.

## Rules

- Each tenant is a self-contained Nuxt module.
- Use `workspace:*` for all local dependencies.
- No core framework code here—only tenant/domain features.
