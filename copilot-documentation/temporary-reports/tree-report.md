# Firestore Ensure Tree – 2025-11-01

Unified ensure flows now live under the Firestore core composables and fan out to tenant- and extension-specific profile domains. This snapshot captures the ensure surface area that downstream packages consume. No modules were deleted in this pass; the listings below are the full file paths currently on disk.

## Core ensure spine

```
packages/core/fireux-core/src/runtime/composables/firestore/core/app/useApp.ts
packages/core/fireux-core/src/runtime/composables/firestore/core/app/main/useAppCollection.ts
packages/core/fireux-core/src/runtime/composables/firestore/core/app/main/useAppComputed.ts
packages/core/fireux-core/src/runtime/composables/firestore/core/app/main/useAppEnsure.ts
packages/core/fireux-core/src/runtime/composables/firestore/core/app/main/useAppFetch.ts
packages/core/fireux-core/src/runtime/composables/firestore/core/app/main/useAppUpdate.ts
packages/core/fireux-core/src/runtime/composables/firestore/core/app/subcollections/useAppUsers.ts
packages/core/fireux-core/src/runtime/composables/firestore/core/app/utils/forms/useAppFormatting.ts
packages/core/fireux-core/src/runtime/composables/firestore/core/app/utils/forms/useAppValidation.ts
packages/core/fireux-core/src/runtime/composables/firestore/core/app/utils/useAppJoinRequests.ts
packages/core/fireux-core/src/runtime/composables/firestore/core/app/utils/useEnvCheck.ts
packages/core/fireux-core/src/runtime/composables/firestore/core/core.md
packages/core/fireux-core/src/runtime/composables/firestore/core/user/useUser.ts
packages/core/fireux-core/src/runtime/composables/firestore/core/user/main/useUserCollection.ts
packages/core/fireux-core/src/runtime/composables/firestore/core/user/main/useUserComputed.ts
packages/core/fireux-core/src/runtime/composables/firestore/core/user/main/useUserDelete.ts
packages/core/fireux-core/src/runtime/composables/firestore/core/user/main/useUserEnsure.ts
packages/core/fireux-core/src/runtime/composables/firestore/core/user/main/useUserFetch.ts
packages/core/fireux-core/src/runtime/composables/firestore/core/user/main/useUserUpdate.ts
packages/core/fireux-core/src/runtime/composables/firestore/core/user/utils/forms/usUserValidation.ts
packages/core/fireux-core/src/runtime/composables/firestore/core/user/utils/forms/useUserFormatting.ts
packages/core/fireux-core/src/runtime/composables/firestore/core/profiles/useProfile.ts
packages/core/fireux-core/src/runtime/composables/firestore/core/profiles/main/useProfileDelete.ts
packages/core/fireux-core/src/runtime/composables/firestore/core/profiles/main/useProfileEnsure.ts
packages/core/fireux-core/src/runtime/composables/firestore/core/profiles/main/useProfileFetch.ts
packages/core/fireux-core/src/runtime/composables/firestore/utils/ensureCommon.ts
packages/core/fireux-core/src/runtime/composables/firestore/utils/useEnsureCommon.ts
```

Key points:

- `ensureDoc` is the shared primitive invoked by app, user, and profile ensures.
- `ensureAppMembership` in `ensureCommon.ts` handles `/apps/{appId}/users/{uid}` joins for any ensure that needs it.
- Each domain ensure returns `{ ensureX }`, keeping public APIs narrow.

## Tenant: fireux-misebox profile surface

```
packages/tenants/fireux-misebox/src/runtime/composables/firestore/profiles/Chef/useChef.ts
packages/tenants/fireux-misebox/src/runtime/composables/firestore/profiles/Chef/useChefCreate.ts
packages/tenants/fireux-misebox/src/runtime/composables/firestore/profiles/Chef/useChefEnsure.ts
packages/tenants/fireux-misebox/src/runtime/composables/firestore/profiles/Chef/useChefFilters.ts
packages/tenants/fireux-misebox/src/runtime/composables/firestore/profiles/Chef/useChefUpdate.ts
packages/tenants/fireux-misebox/src/runtime/composables/firestore/profiles/Chef/utils/useChefFormattingAndValidation.ts
packages/tenants/fireux-misebox/src/runtime/composables/firestore/profiles/Chef/utils/useChefValidation.ts
packages/tenants/fireux-misebox/src/runtime/composables/firestore/profiles/Supplier/useSupplier.ts
packages/tenants/fireux-misebox/src/runtime/composables/firestore/profiles/Supplier/useSupplierCreate.ts
packages/tenants/fireux-misebox/src/runtime/composables/firestore/profiles/Supplier/useSupplierEnsure.ts
packages/tenants/fireux-misebox/src/runtime/composables/firestore/profiles/Supplier/useSupplierFilters.ts
packages/tenants/fireux-misebox/src/runtime/composables/firestore/profiles/Supplier/useSupplierList.ts
packages/tenants/fireux-misebox/src/runtime/composables/firestore/profiles/Supplier/useSupplierQuickCreate.ts
packages/tenants/fireux-misebox/src/runtime/composables/firestore/profiles/Supplier/useSupplierUpdate.ts
packages/tenants/fireux-misebox/src/runtime/composables/firestore/profiles/Supplier/utils/useSupplierValidation.ts
packages/tenants/fireux-misebox/src/runtime/models/profiles/Chef.model.ts
packages/tenants/fireux-misebox/src/runtime/models/profiles/Agent.model.ts
packages/tenants/fireux-misebox/src/runtime/models/profiles/Professional.model.ts
packages/tenants/fireux-misebox/src/runtime/models/profiles/Supplier.model.ts
```

Only Chef and Supplier profile composables remain under the tenant ensure path. Agent and Professional ensure modules now live in the `fireux-jobs` extension (models are still present locally for typings).

## Extension: fireux-jobs profile surface

```
packages/extensions/fireux-jobs/src/runtime/composables/firestore/profiles/Agent/useAgent.ts
packages/extensions/fireux-jobs/src/runtime/composables/firestore/profiles/Agent/useAgentComputed.ts
packages/extensions/fireux-jobs/src/runtime/composables/firestore/profiles/Agent/useAgentCreate.ts
packages/extensions/fireux-jobs/src/runtime/composables/firestore/profiles/Agent/useAgentDelete.ts
packages/extensions/fireux-jobs/src/runtime/composables/firestore/profiles/Agent/useAgentEnsure.ts
packages/extensions/fireux-jobs/src/runtime/composables/firestore/profiles/Agent/useAgentFormattingAndValidation.ts
packages/extensions/fireux-jobs/src/runtime/composables/firestore/profiles/Agent/useAgentUpdate.ts
packages/extensions/fireux-jobs/src/runtime/composables/firestore/profiles/Agent/utils/useAgentFormatting.ts
packages/extensions/fireux-jobs/src/runtime/composables/firestore/profiles/Agent/utils/useAgentValidation.ts
packages/extensions/fireux-jobs/src/runtime/composables/firestore/profiles/Professional/useProfessional.ts
packages/extensions/fireux-jobs/src/runtime/composables/firestore/profiles/Professional/useProfessionalComputed.ts
packages/extensions/fireux-jobs/src/runtime/composables/firestore/profiles/Professional/useProfessionalCreate.ts
packages/extensions/fireux-jobs/src/runtime/composables/firestore/profiles/Professional/useProfessionalDelete.ts
packages/extensions/fireux-jobs/src/runtime/composables/firestore/profiles/Professional/useProfessionalEnsure.ts
packages/extensions/fireux-jobs/src/runtime/composables/firestore/profiles/Professional/useProfessionalFormattingAndValidation.ts
packages/extensions/fireux-jobs/src/runtime/composables/firestore/profiles/Professional/useProfessionalUpdate.ts
packages/extensions/fireux-jobs/src/runtime/composables/firestore/profiles/Professional/utils/useProfessionalFormatting.ts
packages/extensions/fireux-jobs/src/runtime/models/profiles/Agent.model.ts
packages/extensions/fireux-jobs/src/runtime/models/profiles/Professional.model.ts
```

`useAgentEnsure` and `useProfessionalEnsure` mirror the tenant ensures: they pass `{ domain: '<type>' }` into the shared profile ensure flow.

## Alignment checklist

- [x] Core `app`, `user`, and `profiles` ensures share the same helper surface (`ensureDoc`, `ensureAppMembership`, `makeHandle`).
- [x] Every domain-specific ensure returns a single `ensureX` function that passes `{ domain: '<type>' }` into the core ensure.
- [x] Legacy shims under `firestore/profiles/*` were removed; imports now resolve directly to `core/profiles/main/useProfileEnsure.ts`.
- [x] Tenant and extension packages depend only on the shared core ensure API, so future changes (timestamps, logging, etc.) can be made centrally.
