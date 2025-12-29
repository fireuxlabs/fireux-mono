# Entities Inventory

## Core
### App
- Pages:
  - packages/core/fireux-core/src/runtime/pages/apps/index.vue
  - packages/core/fireux-core/src/runtime/pages/apps/[id].vue
  - packages/core/fireux-core/src/runtime/pages/dashboard/app.vue
  - packages/core/fireux-ecosystem-controller/src/runtime/pages/apps/index.vue
- Organisms:
  - packages/core/fireux-core/src/runtime/components/organisms/App/Collection.vue
  - packages/core/fireux-core/src/runtime/components/organisms/App/Preview.vue
  - packages/core/fireux-core/src/runtime/components/organisms/App/Cards/Cell.vue
  - packages/core/fireux-core/src/runtime/components/organisms/App/Cards/Pill.vue
  - packages/core/fireux-core/src/runtime/components/organisms/App/Cards/Profile.vue
  - packages/core/fireux-core/src/runtime/components/organisms/App/Edit/Core.vue
  - packages/core/fireux-core/src/runtime/components/organisms/App/Edit/App.vue
- Composables:
  - packages/core/fireux-core/src/runtime/composables/fireux/firestore/core/app/useApp.ts
  - packages/core/fireux-core/src/runtime/composables/fireux/firestore/core/app/fetch/useAppFetch.ts
  - packages/core/fireux-core/src/runtime/composables/fireux/firestore/core/app/fetch/useAppCollection.ts
  - packages/core/fireux-core/src/runtime/composables/fireux/firestore/core/app/fetch/useAppUsers.ts
  - packages/core/fireux-core/src/runtime/composables/fireux/firestore/core/app/mutations/useAppEnsure.ts
  - packages/core/fireux-core/src/runtime/composables/fireux/firestore/core/app/mutations/useAppUpdate.ts
  - packages/core/fireux-core/src/runtime/composables/fireux/firestore/core/app/mutations/useAppDelete.ts
  - packages/core/fireux-core/src/runtime/composables/fireux/firestore/core/app/utils/useAppJoinRequests.ts
  - packages/core/fireux-core/src/runtime/composables/fireux/firestore/core/app/utils/view/useAppComputed.ts
  - packages/core/fireux-core/src/runtime/composables/fireux/firestore/core/app/utils/view/useAppInterface.ts
  - packages/core/fireux-core/src/runtime/composables/fireux/firestore/core/app/utils/validation/useAppValidation.ts
  - packages/core/fireux-core/src/runtime/composables/fireux/firestore/core/app/utils/validation/useAppFormatting.ts
- Models:
  - packages/core/fireux-core/src/runtime/models/core/app.model.ts
- Index shape:
  - Preview + Collection (no CTA; no toggle; no debug).

### User
- Pages:
  - packages/core/fireux-core/src/runtime/pages/users/index.vue
  - packages/core/fireux-core/src/runtime/pages/users/[id].vue
  - packages/core/fireux-core/src/runtime/pages/dashboard/user-profile.vue
- Organisms:
  - packages/core/fireux-core/src/runtime/components/organisms/User/Collection.vue
  - packages/core/fireux-core/src/runtime/components/organisms/User/CTA.vue
  - packages/core/fireux-core/src/runtime/components/organisms/User/Preview.vue
  - packages/core/fireux-core/src/runtime/components/organisms/User/Cards/Cell.vue
  - packages/core/fireux-core/src/runtime/components/organisms/User/Cards/Pill.vue
  - packages/core/fireux-core/src/runtime/components/organisms/User/Cards/Profile.vue
  - packages/core/fireux-core/src/runtime/components/organisms/User/Edit/App.vue
  - packages/core/fireux-core/src/runtime/components/organisms/User/Edit/Core.vue
  - packages/core/fireux-core/src/runtime/components/organisms/User/Edit/Preview.vue
- Composables:
  - packages/core/fireux-core/src/runtime/composables/fireux/firestore/core/user/useUser.ts
  - packages/core/fireux-core/src/runtime/composables/fireux/firestore/core/user/fetch/useUserFetch.ts
  - packages/core/fireux-core/src/runtime/composables/fireux/firestore/core/user/fetch/useUserCollection.ts
  - packages/core/fireux-core/src/runtime/composables/fireux/firestore/core/user/mutations/useUserEnsure.ts
  - packages/core/fireux-core/src/runtime/composables/fireux/firestore/core/user/mutations/useUserUpdate.ts
  - packages/core/fireux-core/src/runtime/composables/fireux/firestore/core/user/mutations/useUserDelete.ts
  - packages/core/fireux-core/src/runtime/composables/fireux/firestore/core/user/utils/ensureHelpers.ts
  - packages/core/fireux-core/src/runtime/composables/fireux/firestore/core/user/utils/update/useCoreUserUpdate.ts
  - packages/core/fireux-core/src/runtime/composables/fireux/firestore/core/user/utils/update/useAppUserUpdate.ts
  - packages/core/fireux-core/src/runtime/composables/fireux/firestore/core/user/utils/view/useUserComputed.ts
  - packages/core/fireux-core/src/runtime/composables/fireux/firestore/core/user/utils/view/useUserInterface.ts
  - packages/core/fireux-core/src/runtime/composables/fireux/firestore/core/user/utils/validation/useUserFormatting.ts
- Models:
  - packages/core/fireux-core/src/runtime/models/core/user.model.ts
  - packages/extensions/fireux-blogs/src/runtime/models/core/user.ext.ts
  - packages/extensions/fireux-products/src/runtime/models/core/user.ext.ts
- Index shape:
  - Preview + Collection with tenant toggle (global directory toggle; no CTA; no debug).

## Profiles
### Agent
- Pages:
  - packages/extensions/fireux-jobs/src/runtime/pages/agents/index.vue
  - packages/extensions/fireux-jobs/src/runtime/pages/agents/[id].vue
  - packages/extensions/fireux-jobs/src/runtime/pages/agents/learn-more.vue
  - packages/extensions/fireux-jobs/src/runtime/pages/dashboard/agent/index.vue
  - packages/extensions/fireux-jobs/src/runtime/pages/dashboard/agent/profile.vue
  - packages/extensions/fireux-jobs/src/runtime/pages/dashboard/agent/my-gigs.vue
- Organisms:
  - packages/extensions/fireux-jobs/src/runtime/components/organisms/profiles/Agent/CTA.vue
  - packages/extensions/fireux-jobs/src/runtime/components/organisms/profiles/Agent/Profile.vue
  - packages/extensions/fireux-jobs/src/runtime/components/organisms/profiles/Agent/Preview.vue
  - packages/extensions/fireux-jobs/src/runtime/components/organisms/profiles/Agent/Create/System.vue
  - packages/extensions/fireux-jobs/src/runtime/components/organisms/profiles/Agent/Edit/App.vue
  - packages/extensions/fireux-jobs/src/runtime/components/organisms/profiles/Agent/Edit/Core.vue
  - packages/extensions/fireux-jobs/src/runtime/components/organisms/profiles/Agent/Edit/Preview.vue
  - packages/extensions/fireux-jobs/src/runtime/components/organisms/profiles/Agent/Cards/Cell.vue
  - packages/extensions/fireux-jobs/src/runtime/components/organisms/profiles/Agent/Cards/Pill.vue
  - packages/extensions/fireux-jobs/src/runtime/components/organisms/profiles/Agent/Sections/LocalCollection.vue
  - packages/extensions/fireux-jobs/src/runtime/components/organisms/profiles/Agent/Sections/GlobalCollection.vue
- Composables:
  - packages/extensions/fireux-jobs/src/runtime/composables/fireux/firestore/profiles/Agent/useAgent.ts
  - packages/extensions/fireux-jobs/src/runtime/composables/fireux/firestore/profiles/Agent/utils.ts
  - packages/extensions/fireux-jobs/src/runtime/composables/fireux/firestore/profiles/Agent/main/useAgentCollection.ts
  - packages/extensions/fireux-jobs/src/runtime/composables/fireux/firestore/profiles/Agent/main/useAgentCreate.ts
  - packages/extensions/fireux-jobs/src/runtime/composables/fireux/firestore/profiles/Agent/main/useAgentDelete.ts
  - packages/extensions/fireux-jobs/src/runtime/composables/fireux/firestore/profiles/Agent/main/useAgentUpdate.ts
  - packages/extensions/fireux-jobs/src/runtime/composables/fireux/firestore/profiles/Agent/main/useAgentComputed.ts
  - packages/extensions/fireux-jobs/src/runtime/composables/fireux/firestore/profiles/Agent/main/useAgentInterface.ts
- Models:
  - packages/extensions/fireux-jobs/src/runtime/models/profiles/Agent/Agent.model.ts
  - packages/extensions/fireux-jobs/src/runtime/models/profiles/Agent/supporting.ts
- Index shape:
  - Preview + Sections (Local + Global) with tenant toggle (global directory toggle; no debug).

### Chef
- Pages:
  - packages/ecosystem/fireux-misebox/src/runtime/pages/chefs/index.vue
  - packages/ecosystem/fireux-misebox/src/runtime/pages/chefs/[id].vue
  - packages/ecosystem/fireux-misebox/src/runtime/pages/chefs/learn-more.vue
  - packages/ecosystem/fireux-misebox/src/runtime/pages/dashboard/chef/index.vue
  - packages/ecosystem/fireux-misebox/src/runtime/pages/dashboard/chef/profile.vue
  - packages/ecosystem/fireux-misebox/src/runtime/pages/dashboard/chef/my-recipes.vue
- Organisms:
  - packages/ecosystem/fireux-misebox/src/runtime/components/organisms/profiles/Chef/CTA.vue
  - packages/ecosystem/fireux-misebox/src/runtime/components/organisms/profiles/Chef/Profile.vue
  - packages/ecosystem/fireux-misebox/src/runtime/components/organisms/profiles/Chef/Preview.vue
  - packages/ecosystem/fireux-misebox/src/runtime/components/organisms/profiles/Chef/Create/System.vue
  - packages/ecosystem/fireux-misebox/src/runtime/components/organisms/profiles/Chef/Edit/App.vue
  - packages/ecosystem/fireux-misebox/src/runtime/components/organisms/profiles/Chef/Edit/Core.vue
  - packages/ecosystem/fireux-misebox/src/runtime/components/organisms/profiles/Chef/Edit/Preview.vue
  - packages/ecosystem/fireux-misebox/src/runtime/components/organisms/profiles/Chef/Cards/Cell.vue
  - packages/ecosystem/fireux-misebox/src/runtime/components/organisms/profiles/Chef/Cards/Pill.vue
  - packages/ecosystem/fireux-misebox/src/runtime/components/organisms/profiles/Chef/Sections/LocalCollection.vue
  - packages/ecosystem/fireux-misebox/src/runtime/components/organisms/profiles/Chef/Sections/GlobalCollection.vue
- Composables:
  - packages/ecosystem/fireux-misebox/src/runtime/composables/fireux/firestore/profiles/Chef/useChef.ts
  - packages/ecosystem/fireux-misebox/src/runtime/composables/fireux/firestore/profiles/Chef/utils.ts
  - packages/ecosystem/fireux-misebox/src/runtime/composables/fireux/firestore/profiles/Chef/main/useChefCollection.ts
  - packages/ecosystem/fireux-misebox/src/runtime/composables/fireux/firestore/profiles/Chef/main/useChefCreate.ts
  - packages/ecosystem/fireux-misebox/src/runtime/composables/fireux/firestore/profiles/Chef/main/useChefDelete.ts
  - packages/ecosystem/fireux-misebox/src/runtime/composables/fireux/firestore/profiles/Chef/main/useChefUpdate.ts
  - packages/ecosystem/fireux-misebox/src/runtime/composables/fireux/firestore/profiles/Chef/main/useChefComputed.ts
  - packages/ecosystem/fireux-misebox/src/runtime/composables/fireux/firestore/profiles/Chef/main/useChefInterface.ts
- Models:
  - packages/ecosystem/fireux-misebox/src/runtime/models/profiles/Chef/Chef.model.ts
  - packages/ecosystem/fireux-misebox/src/runtime/models/profiles/Chef/supporting.ts
- Index shape:
  - Preview + Sections (Local + Global) with tenant toggle (global directory toggle; no debug).

### Professional
- Pages:
  - packages/extensions/fireux-jobs/src/runtime/pages/professionals/index.vue
  - packages/extensions/fireux-jobs/src/runtime/pages/professionals/[id].vue
  - packages/extensions/fireux-jobs/src/runtime/pages/professionals/learn-more.vue
  - packages/extensions/fireux-jobs/src/runtime/pages/dashboard/professional/index.vue
  - packages/extensions/fireux-jobs/src/runtime/pages/dashboard/professional/profile.vue
  - packages/extensions/fireux-jobs/src/runtime/pages/dashboard/professional/my-jobs.vue
- Organisms:
  - packages/extensions/fireux-jobs/src/runtime/components/organisms/profiles/Professional/CTA.vue
  - packages/extensions/fireux-jobs/src/runtime/components/organisms/profiles/Professional/Profile.vue
  - packages/extensions/fireux-jobs/src/runtime/components/organisms/profiles/Professional/Preview.vue
  - packages/extensions/fireux-jobs/src/runtime/components/organisms/profiles/Professional/Create/System.vue
  - packages/extensions/fireux-jobs/src/runtime/components/organisms/profiles/Professional/Edit/App.vue
  - packages/extensions/fireux-jobs/src/runtime/components/organisms/profiles/Professional/Edit/Core.vue
  - packages/extensions/fireux-jobs/src/runtime/components/organisms/profiles/Professional/Edit/Preview.vue
  - packages/extensions/fireux-jobs/src/runtime/components/organisms/profiles/Professional/Cards/Cell.vue
  - packages/extensions/fireux-jobs/src/runtime/components/organisms/profiles/Professional/Cards/Pill.vue
  - packages/extensions/fireux-jobs/src/runtime/components/organisms/profiles/Professional/Sections/LocalCollection.vue
  - packages/extensions/fireux-jobs/src/runtime/components/organisms/profiles/Professional/Sections/GlobalCollection.vue
  - packages/extensions/fireux-jobs/src/runtime/components/organisms/profiles/shared/professional/CertificationSection.vue
  - packages/extensions/fireux-jobs/src/runtime/components/organisms/profiles/shared/professional/EducationSection.vue
  - packages/extensions/fireux-jobs/src/runtime/components/organisms/profiles/shared/professional/ExperienceSection.vue
  - packages/extensions/fireux-jobs/src/runtime/components/organisms/profiles/shared/professional/ProjectSection.vue
  - packages/extensions/fireux-jobs/src/runtime/components/organisms/profiles/shared/professional/VolunteerSection.vue
- Composables:
  - packages/extensions/fireux-jobs/src/runtime/composables/fireux/firestore/profiles/Professional/useProfessional.ts
  - packages/extensions/fireux-jobs/src/runtime/composables/fireux/firestore/profiles/Professional/utils.ts
  - packages/extensions/fireux-jobs/src/runtime/composables/fireux/firestore/profiles/Professional/main/useProfessionalCollection.ts
  - packages/extensions/fireux-jobs/src/runtime/composables/fireux/firestore/profiles/Professional/main/useProfessionalCreate.ts
  - packages/extensions/fireux-jobs/src/runtime/composables/fireux/firestore/profiles/Professional/main/useProfessionalDelete.ts
  - packages/extensions/fireux-jobs/src/runtime/composables/fireux/firestore/profiles/Professional/main/useProfessionalUpdate.ts
  - packages/extensions/fireux-jobs/src/runtime/composables/fireux/firestore/profiles/Professional/main/useProfessionalComputed.ts
  - packages/extensions/fireux-jobs/src/runtime/composables/fireux/firestore/profiles/Professional/main/useProfessionalInterface.ts
- Models:
  - packages/extensions/fireux-jobs/src/runtime/models/profiles/Professional/Professional.model.ts
  - packages/extensions/fireux-jobs/src/runtime/models/profiles/Professional/supporting.ts
- Index shape:
  - Preview + Sections (Local optional + Global) with toggle + debug panel (JSON + copy).

### Profile
- Pages:
  - (none found)
- Organisms:
  - packages/core/fireux-core/src/runtime/components/organisms/Profile/List.vue
  - packages/core/fireux-core/src/runtime/components/organisms/Profile/Page.vue
  - packages/core/fireux-core/src/runtime/components/organisms/Profile/Root.vue
  - packages/core/fireux-core/src/runtime/components/organisms/Profile/Sections/Single.vue
- Composables:
  - packages/core/fireux-core/src/runtime/composables/fireux/firestore/core/profile/useProfile.ts
  - packages/core/fireux-core/src/runtime/composables/fireux/firestore/core/profile/fetch/useProfileFetch.ts
  - packages/core/fireux-core/src/runtime/composables/fireux/firestore/core/profile/fetch/useProfileCollection.ts
  - packages/core/fireux-core/src/runtime/composables/fireux/firestore/core/profile/mutations/useProfileEnsure.ts
  - packages/core/fireux-core/src/runtime/composables/fireux/firestore/core/profile/mutations/useProfileUpdate.ts
  - packages/core/fireux-core/src/runtime/composables/fireux/firestore/core/profile/mutations/useProfileDelete.ts
  - packages/core/fireux-core/src/runtime/composables/fireux/firestore/core/profile/utils/view/useProfileComputed.ts
- Models:
  - packages/core/fireux-core/src/runtime/models/core/profile.model.ts
- Index shape:
  - No runtime index page.

### Supplier
- Pages:
  - packages/ecosystem/fireux-misebox/src/runtime/pages/suppliers/index.vue
  - packages/ecosystem/fireux-misebox/src/runtime/pages/suppliers/[id].vue
  - packages/ecosystem/fireux-misebox/src/runtime/pages/suppliers/learn-more.vue
  - packages/ecosystem/fireux-misebox/src/runtime/pages/dashboard/supplier/index.vue
  - packages/ecosystem/fireux-misebox/src/runtime/pages/dashboard/supplier/profile.vue
  - packages/ecosystem/fireux-misebox/src/runtime/pages/dashboard/supplier/my-stock.vue
- Organisms:
  - packages/ecosystem/fireux-misebox/src/runtime/components/organisms/profiles/Supplier/CTA.vue
  - packages/ecosystem/fireux-misebox/src/runtime/components/organisms/profiles/Supplier/Profile.vue
  - packages/ecosystem/fireux-misebox/src/runtime/components/organisms/profiles/Supplier/Preview.vue
  - packages/ecosystem/fireux-misebox/src/runtime/components/organisms/profiles/Supplier/Create/System.vue
  - packages/ecosystem/fireux-misebox/src/runtime/components/organisms/profiles/Supplier/Edit/App.vue
  - packages/ecosystem/fireux-misebox/src/runtime/components/organisms/profiles/Supplier/Edit/Core.vue
  - packages/ecosystem/fireux-misebox/src/runtime/components/organisms/profiles/Supplier/Edit/Preview.vue
  - packages/ecosystem/fireux-misebox/src/runtime/components/organisms/profiles/Supplier/Cards/Cell.vue
  - packages/ecosystem/fireux-misebox/src/runtime/components/organisms/profiles/Supplier/Cards/Pill.vue
  - packages/ecosystem/fireux-misebox/src/runtime/components/organisms/profiles/Supplier/Sections/LocalCollection.vue
  - packages/ecosystem/fireux-misebox/src/runtime/components/organisms/profiles/Supplier/Sections/GlobalCollection.vue
  - packages/ecosystem/fireux-misebox/src/runtime/components/organisms/profiles/shared/SupplierQuickCreate.vue
- Composables:
  - packages/ecosystem/fireux-misebox/src/runtime/composables/fireux/firestore/profiles/Supplier/useSupplier.ts
  - packages/ecosystem/fireux-misebox/src/runtime/composables/fireux/firestore/profiles/Supplier/utils.ts
  - packages/ecosystem/fireux-misebox/src/runtime/composables/fireux/firestore/profiles/Supplier/main/useSupplierCollection.ts
  - packages/ecosystem/fireux-misebox/src/runtime/composables/fireux/firestore/profiles/Supplier/main/useSupplierCreate.ts
  - packages/ecosystem/fireux-misebox/src/runtime/composables/fireux/firestore/profiles/Supplier/main/useSupplierDelete.ts
  - packages/ecosystem/fireux-misebox/src/runtime/composables/fireux/firestore/profiles/Supplier/main/useSupplierUpdate.ts
  - packages/ecosystem/fireux-misebox/src/runtime/composables/fireux/firestore/profiles/Supplier/main/useSupplierComputed.ts
  - packages/ecosystem/fireux-misebox/src/runtime/composables/fireux/firestore/profiles/Supplier/main/useSupplierInterface.ts
  - packages/ecosystem/fireux-misebox/src/runtime/composables/fireux/firestore/profiles/Supplier/main/useSupplierList.ts
  - packages/ecosystem/fireux-misebox/src/runtime/composables/fireux/firestore/profiles/Supplier/main/useSupplierQuickCreate.ts
- Models:
  - packages/ecosystem/fireux-misebox/src/runtime/models/profiles/Supplier/Supplier.model.ts
  - packages/ecosystem/fireux-misebox/src/runtime/models/profiles/Supplier/supporting.ts
- Index shape:
  - Preview + Sections (Local + Global) with tenant toggle (global directory toggle; no debug).

## Objects
### Blog
- Pages:
  - packages/extensions/fireux-blogs/src/runtime/pages/blog/index.vue
  - packages/extensions/fireux-blogs/src/runtime/pages/blog/create.vue
  - packages/extensions/fireux-blogs/src/runtime/pages/blog/[slug].vue
- Organisms:
  - packages/extensions/fireux-blogs/src/runtime/components/organisms/objects/Blog/CTA.vue
  - packages/extensions/fireux-blogs/src/runtime/components/organisms/objects/Blog/List.vue
  - packages/extensions/fireux-blogs/src/runtime/components/organisms/objects/Blog/Create/Advanced.vue
  - packages/extensions/fireux-blogs/src/runtime/components/organisms/objects/Blog/Create/Images.vue
  - packages/extensions/fireux-blogs/src/runtime/components/organisms/objects/Blog/Create/Preview.vue
  - packages/extensions/fireux-blogs/src/runtime/components/organisms/objects/Blog/Create/System.vue
  - packages/extensions/fireux-blogs/src/runtime/components/organisms/objects/Blog/Create/Write.vue
  - packages/extensions/fireux-blogs/src/runtime/components/organisms/objects/Blog/Cards/Article.vue
  - packages/extensions/fireux-blogs/src/runtime/components/organisms/objects/Blog/Cards/Cell.vue
  - packages/extensions/fireux-blogs/src/runtime/components/organisms/objects/Blog/Cards/Page.vue
  - packages/extensions/fireux-blogs/src/runtime/components/organisms/objects/Blog/Cards/Product.vue
- Composables:
  - packages/extensions/fireux-blogs/src/runtime/composables/useBlogPermissions.ts
  - packages/extensions/fireux-blogs/src/runtime/composables/fireux/firestore/objects/blog/useBlog.ts
  - packages/extensions/fireux-blogs/src/runtime/composables/fireux/firestore/objects/blog/fetch/useBlogFetch.ts
  - packages/extensions/fireux-blogs/src/runtime/composables/fireux/firestore/objects/blog/mutations/useBlogCreate.ts
  - packages/extensions/fireux-blogs/src/runtime/composables/fireux/firestore/objects/blog/mutations/useBlogUpdate.ts
  - packages/extensions/fireux-blogs/src/runtime/composables/fireux/firestore/objects/blog/mutations/useBlogDelete.ts
  - packages/extensions/fireux-blogs/src/runtime/composables/fireux/firestore/objects/blog/utils/useBlogUtils.ts
  - packages/extensions/fireux-blogs/src/runtime/composables/fireux/firestore/objects/blog/utils/view/useBlogInterface.ts
  - packages/extensions/fireux-blogs/src/runtime/composables/fireux/firestore/blogs/post/state/useBlogDraftState.ts
  - packages/extensions/fireux-blogs/src/runtime/composables/fireux/firestore/blogs/post/state/useBlogCreateSubmit.ts
- Models:
  - packages/extensions/fireux-blogs/src/runtime/models/objects/blogPost.model.ts
- Index shape:
  - CTA (page-level v-if) + List (no toggle; no debug).

### Company
- Pages:
  - (none found)
- Organisms:
  - (none found)
- Composables:
  - packages/extensions/fireux-companies/src/runtime/composables/fireux/firestore/objects/company/useCompanies.ts
  - packages/extensions/fireux-companies/src/runtime/composables/fireux/firestore/objects/company/fetch/useCompanyFetch.ts
  - packages/extensions/fireux-companies/src/runtime/composables/fireux/firestore/objects/company/mutations/useCompanyCreate.ts
  - packages/extensions/fireux-companies/src/runtime/composables/fireux/firestore/objects/company/mutations/useCompanyUpdate.ts
- Models:
  - packages/extensions/fireux-companies/src/runtime/models/objects/company.model.ts
- Index shape:
  - No runtime index page.

### Dish
- Pages:
  - (none found)
- Organisms:
  - (none found)
- Composables:
  - (none found)
- Models:
  - packages/ecosystem/fireux-misebox/src/runtime/models/objects/Dish.model.ts
- Index shape:
  - No runtime index page.

### Ingredient
- Pages:
  - packages/ecosystem/fireux-misebox/src/runtime/pages/ingredients/index.vue
  - packages/ecosystem/fireux-misebox/src/runtime/pages/ingredients/[id].vue
- Organisms:
  - packages/ecosystem/fireux-misebox/src/runtime/components/organisms/objects/Ingredient/Edit.vue
  - packages/ecosystem/fireux-misebox/src/runtime/components/organisms/objects/Ingredient/Profile.vue
  - packages/ecosystem/fireux-misebox/src/runtime/components/organisms/objects/Ingredient/Create/System.vue
  - packages/ecosystem/fireux-misebox/src/runtime/components/organisms/objects/Ingredient/Cards/Cell.vue
  - packages/ecosystem/fireux-misebox/src/runtime/components/organisms/objects/Ingredient/Cards/Pill.vue
  - packages/ecosystem/fireux-misebox/src/runtime/components/organisms/objects/Ingredient/Cards/Profile.vue
- Composables:
  - packages/ecosystem/fireux-misebox/src/runtime/composables/fireux/firestore/objects/ingredient/useIngredient.ts
  - packages/ecosystem/fireux-misebox/src/runtime/composables/fireux/firestore/objects/ingredient/useIngredientCreate.ts
  - packages/ecosystem/fireux-misebox/src/runtime/composables/fireux/firestore/objects/ingredient/useIngredientFilters.ts
- Models:
  - packages/ecosystem/fireux-misebox/src/runtime/models/objects/Ingredient.model.ts
- Index shape:
  - Simple list of ingredient cells (no UPage header; no toggle; no debug).

### Job
- Pages:
  - packages/extensions/fireux-jobs/src/runtime/pages/jobs/index.vue
  - packages/extensions/fireux-jobs/src/runtime/pages/jobs/create.vue
  - packages/extensions/fireux-jobs/src/runtime/pages/jobs/[id].vue
  - packages/extensions/fireux-jobs/src/runtime/pages/jobs/edit/[id].vue
  - packages/extensions/fireux-jobs/src/runtime/pages/jobs/learn-more.vue
- Organisms:
  - packages/extensions/fireux-jobs/src/runtime/components/organisms/objects/Job/CTA.vue
  - packages/extensions/fireux-jobs/src/runtime/components/organisms/objects/Job/Create/Preview.vue
  - packages/extensions/fireux-jobs/src/runtime/components/organisms/objects/Job/Create/System.vue
  - packages/extensions/fireux-jobs/src/runtime/components/organisms/objects/Job/Create/Write.vue
  - packages/extensions/fireux-jobs/src/runtime/components/organisms/objects/Job/Sections/AgentCollection.vue
  - packages/extensions/fireux-jobs/src/runtime/components/organisms/objects/Job/Sections/GlobalCollection.vue
- Composables:
  - packages/extensions/fireux-jobs/src/runtime/composables/useJobPermissions.ts
  - packages/extensions/fireux-jobs/src/runtime/composables/fireux/app/routes/useJobRoutes.ts
  - packages/extensions/fireux-jobs/src/runtime/composables/fireux/app/routes/useJobDashboardRoutes.ts
  - packages/extensions/fireux-jobs/src/runtime/composables/fireux/firestore/jobs/useJob.ts
  - packages/extensions/fireux-jobs/src/runtime/composables/fireux/firestore/jobs/fetch/useJobFetch.ts
  - packages/extensions/fireux-jobs/src/runtime/composables/fireux/firestore/jobs/fetch/useJobCollection.ts
  - packages/extensions/fireux-jobs/src/runtime/composables/fireux/firestore/jobs/mutations/useJobCreate.ts
  - packages/extensions/fireux-jobs/src/runtime/composables/fireux/firestore/jobs/mutations/useJobUpdate.ts
  - packages/extensions/fireux-jobs/src/runtime/composables/fireux/firestore/jobs/mutations/useJobDelete.ts
  - packages/extensions/fireux-jobs/src/runtime/composables/fireux/firestore/jobs/state/useJobState.ts
  - packages/extensions/fireux-jobs/src/runtime/composables/fireux/firestore/jobs/utils/view/useJobComputed.ts
  - packages/extensions/fireux-jobs/src/runtime/composables/fireux/firestore/jobs/utils/view/useJobInterface.ts
- Models:
  - packages/extensions/fireux-jobs/src/runtime/models/job.model.ts
- Index shape:
  - CTA (page-level v-if) + Sections (AgentCollection gated + GlobalCollection always).

### Kitchen
- Pages:
  - packages/extensions/fireux-kitchens/src/runtime/pages/kitchens/index.vue
- Organisms:
  - (none found)
- Composables:
  - packages/extensions/fireux-kitchens/src/runtime/composables/fireux/firestore/objects/kitchen/useKitchens.ts
  - packages/extensions/fireux-kitchens/src/runtime/composables/fireux/firestore/objects/kitchen/fetch/useKitchenCollection.ts
- Models:
  - packages/extensions/fireux-kitchens/src/runtime/models/objects/kitchen.model.ts
- Index shape:
  - Inline list of kitchen labels (no CTA; no toggle; no debug).

### Menu
- Pages:
  - (none found)
- Organisms:
  - (none found)
- Composables:
  - (none found)
- Models:
  - packages/ecosystem/fireux-misebox/src/runtime/models/objects/Menu.model.ts
- Index shape:
  - No runtime index page.

### MiseApp
- Pages:
  - packages/ecosystem/fireux-misebox/src/runtime/pages/misebox-apps/index.vue
- Organisms:
  - (none found)
- Composables:
  - packages/ecosystem/fireux-misebox/src/runtime/composables/fireux/firestore/core/useMiseApp.ts
- Models:
  - packages/ecosystem/fireux-misebox/src/runtime/models/core/MiseApp.model.ts
- Index shape:
  - Card-based list of apps and nested users (no UPage header; no toggle; no debug).

### MiseEnPlace
- Pages:
  - (none found)
- Organisms:
  - (none found)
- Composables:
  - (none found)
- Models:
  - packages/ecosystem/fireux-misebox/src/runtime/models/objects/MiseEnPlace.model.ts
- Index shape:
  - No runtime index page.

### Place
- Pages:
  - packages/extensions/fireux-places/src/runtime/pages/places/index.vue
- Organisms:
  - packages/extensions/fireux-places/src/runtime/components/organisms/objects/Place/Cell.vue
  - packages/extensions/fireux-places/src/runtime/components/organisms/objects/Place/List.vue
  - packages/extensions/fireux-places/src/runtime/components/organisms/objects/Place/Search/Bar.vue
  - packages/extensions/fireux-places/src/runtime/components/organisms/objects/Place/Search/Dropdown.vue
  - packages/extensions/fireux-places/src/runtime/components/organisms/objects/Place/Search/Section.vue
  - packages/extensions/fireux-places/src/runtime/components/organisms/objects/Place/Search/Selected.vue
- Composables:
  - packages/extensions/fireux-places/src/runtime/composables/fireux/firestore/objects/place/usePlaces.ts
  - packages/extensions/fireux-places/src/runtime/composables/fireux/firestore/objects/place/fetch/usePlaceCollection.ts
  - packages/extensions/fireux-places/src/runtime/composables/fireux/firestore/objects/place/fetch/google/usePlacesGoogle.ts
  - packages/extensions/fireux-places/src/runtime/composables/fireux/firestore/objects/place/fetch/search/usePlacesSearch.ts
  - packages/extensions/fireux-places/src/runtime/composables/fireux/firestore/objects/place/mutations/usePlaceCreate.ts
  - packages/extensions/fireux-places/src/runtime/composables/fireux/firestore/objects/place/mutations/usePlaceSave.ts
  - packages/extensions/fireux-places/src/runtime/composables/fireux/firestore/objects/place/utils/placeCollections.ts
  - packages/extensions/fireux-places/src/runtime/composables/fireux/firestore/objects/place/utils/view/usePlaceLogos.ts
  - packages/extensions/fireux-places/src/runtime/composables/fireux/firestore/objects/place/utils/view/usePlacesInterface.ts
- Models:
  - packages/extensions/fireux-places/src/runtime/models/place.model.ts
  - packages/extensions/fireux-places/src/runtime/models/objects/place.model.ts
- Index shape:
  - Search/confirm “CTA-like” section + List (no toggle; no debug).

### Product
- Pages:
  - packages/extensions/fireux-products/src/runtime/pages/products/index.vue
  - packages/extensions/fireux-products/src/runtime/pages/products/create.vue
  - packages/extensions/fireux-products/src/runtime/pages/products/[slug].vue
- Organisms:
  - packages/extensions/fireux-products/src/runtime/components/organisms/objects/Product/CTA.vue
  - packages/extensions/fireux-products/src/runtime/components/organisms/objects/Product/Create/Basic.vue
  - packages/extensions/fireux-products/src/runtime/components/organisms/objects/Product/Create/Preview.vue
  - packages/extensions/fireux-products/src/runtime/components/organisms/objects/Product/Create/Price.vue
  - packages/extensions/fireux-products/src/runtime/components/organisms/objects/Product/Create/Prices.vue
  - packages/extensions/fireux-products/src/runtime/components/organisms/objects/Product/Create/Stock.vue
  - packages/extensions/fireux-products/src/runtime/components/organisms/objects/Product/Create/System.vue
  - packages/extensions/fireux-products/src/runtime/components/organisms/objects/Product/Create/Write.vue
  - packages/extensions/fireux-products/src/runtime/components/organisms/objects/Product/Cards/List.vue
  - packages/extensions/fireux-products/src/runtime/components/organisms/objects/Product/Cards/Prices.vue
  - packages/extensions/fireux-products/src/runtime/components/organisms/objects/Product/Cards/Product.vue
- Composables:
  - packages/extensions/fireux-products/src/runtime/composables/useProductPermissions.ts
  - packages/extensions/fireux-products/src/runtime/composables/fireux/firestore/objects/product/useProduct.ts
  - packages/extensions/fireux-products/src/runtime/composables/fireux/firestore/objects/product/useProducts.ts
  - packages/extensions/fireux-products/src/runtime/composables/fireux/firestore/objects/product/useProductCreate.ts
  - packages/extensions/fireux-products/src/runtime/composables/fireux/firestore/objects/product/useProductUpdate.ts
  - packages/extensions/fireux-products/src/runtime/composables/fireux/firestore/objects/product/useProductDelete.ts
  - packages/extensions/fireux-products/src/runtime/composables/fireux/firestore/objects/product/useProductUtils.ts
  - packages/extensions/fireux-products/src/runtime/composables/fireux/firestore/objects/product/fetch/useProductCollection.ts
  - packages/extensions/fireux-products/src/runtime/composables/fireux/firestore/objects/product/fetch/useProductRead.ts
  - packages/extensions/fireux-products/src/runtime/composables/fireux/firestore/objects/product/fetch/useProductBySlug.ts
  - packages/extensions/fireux-products/src/runtime/composables/fireux/firestore/objects/product/fetch/useProductPrices.ts
  - packages/extensions/fireux-products/src/runtime/composables/fireux/firestore/objects/product/state/useCreateProductState.ts
  - packages/extensions/fireux-products/src/runtime/composables/fireux/firestore/objects/product/state/useProductCreateSubmit.ts
  - packages/extensions/fireux-products/src/runtime/composables/fireux/firestore/objects/product/utils/useProductFormatting.ts
  - packages/extensions/fireux-products/src/runtime/composables/fireux/firestore/objects/product/utils/useProductValidation.ts
  - packages/extensions/fireux-products/src/runtime/composables/fireux/firestore/objects/product/utils/view/useProductInterface.ts
  - packages/extensions/fireux-products/src/runtime/composables/fireux/firestore/objects/product/Prices/useCreatePricesState.ts
- Models:
  - packages/extensions/fireux-products/src/runtime/models/objects/product.model.ts
- Index shape:
  - CTA (page-level v-if) + Cards list (no toggle; no debug).

### Recipe
- Pages:
  - packages/ecosystem/fireux-misebox/src/runtime/pages/recipes/index.vue
  - packages/ecosystem/fireux-misebox/src/runtime/pages/recipes/[slug].vue
- Organisms:
  - packages/ecosystem/fireux-misebox/src/runtime/components/organisms/objects/Recipe/Cards/Pill.vue
- Composables:
  - packages/ecosystem/fireux-misebox/src/runtime/composables/fireux/firestore/objects/recipe/useRecipes.ts
  - packages/ecosystem/fireux-misebox/src/runtime/composables/fireux/firestore/objects/recipe/useRecipeCreate.ts
  - packages/ecosystem/fireux-misebox/src/runtime/composables/fireux/firestore/objects/recipe/useRecipeUpdate.ts
  - packages/ecosystem/fireux-misebox/src/runtime/composables/fireux/firestore/objects/recipe/useRecipeDelete.ts
- Models:
  - packages/ecosystem/fireux-misebox/src/runtime/models/objects/Recipe.model.ts
  - packages/ecosystem/fireux-misebox/src/runtime/models/objects/RecipeSimple.model.ts
- Index shape:
  - Search + Filters toggle + Create modal + Grid list + loading/error/empty states.

### Task
- Pages:
  - (none found)
- Organisms:
  - (none found)
- Composables:
  - (none found)
- Models:
  - packages/core/fireux-core/src/runtime/models/task.model.ts
  - packages/ecosystem/fireux-misebox/src/runtime/models/objects/Task.model.ts
- Index shape:
  - No runtime index page.

## Index migration order suggestion
1. Place
2. Blog
3. Product
4. Job
5. Agent
6. Professional
7. User
8. App
9. Chef
10. Supplier
10. Ingredient
11. Recipe
12. Kitchen
13. Company
