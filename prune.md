# Prune list (profiles alignment)

Remove or migrate the following to enforce the new core-driven profiles shape (generic read; per-entity update + formatting/validation only):

- packages/extensions/fireux-jobs/src/runtime/composables/firestore/profiles/Professional/useProfessional.ts

  - Transitional facade now redundant. Editors should import:
    - read: useProfile(professionalConfig) from core (auto-import)
    - write: useProfessionalUpdate
    - helpers: useProfessionalFormattingAndValidation

- packages/extensions/fireux-jobs/src/runtime/components/Organisms/profiles/Professional/Fields/KitchenExperience.vue

  - Kitchen-specific; Professional is now neutral. Keep kitchen logic under Chef only.

- packages/extensions/fireux-jobs/src/runtime/components/Organisms/profiles/Professional/Fields/KitchenSearchWizard.vue

  - Kitchen-centric quick add. Replace with neutral Experience quick-add if needed per app.

- packages/extensions/fireux-jobs/src/runtime/components/Organisms/profiles/Professional/Profile.vue (kitchen-specific sections already removed)

  - Verify no lingering kitchen_experience references; now uses relevant/other experience.

- packages/tenants/fireux-misebox/src/runtime/composables/firestore/profiles/Chef/utils/useChefValidation.ts
  - Renamed and re-exported as useChefFormattingAndValidation.ts at sibling level. Delete the utils/ file after consumers update.

Notes

- Do not add new per-entity computed/ensure/delete; use core useProfile\*, which are in place.
- Ensure per-entity updaters accept scope: 'auto'|'core'|'app', mirroring useUserUpdate.
- Validate that all imports avoid restricted fireux-core subpaths; rely on auto-imports or public entrypoints.
