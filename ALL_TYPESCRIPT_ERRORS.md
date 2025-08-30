# Complete TypeScript Errors Report

**FireUX Monorepo - All 168 TypeScript Errors**  
**Generated**: 29 August 2025

---

## **1. fireux-core Package (69 errors)**

**Location**: `/packages/core/fireux-core`

### Config Errors (3)

1. `src/config/errors-config.ts(8,33)`: TS6133 - 'resolver' is declared but its value is never read
2. `src/config/errors-config.ts(8,48)`: TS6133 - 'nuxt' is declared but its value is never read
3. `src/config/layouts-config.ts(9,49)`: TS6133 - 'nuxt' is declared but its value is never read

### Admin Composables (3)

4. `src/runtime/composables/admin/useAdminMetrics.ts(1,1)`: TS6133 - 'useUserMetrics' is declared but its value is never read
5. `src/runtime/composables/admin/useUserMetrics.ts(1,1)`: TS6133 - 'computed' is declared but its value is never read
6. `src/runtime/composables/admin/useUserMetrics.ts(2,1)`: TS6133 - 'useAppUser' is declared but its value is never read

### App Routes (2)

7. `src/runtime/composables/app/routes/useAdminRoutes.ts(45,9)`: TS2741 - Property 'to' is missing in type '{ id: string; label: string; icon: string; children: RouteLink[]; }' but required in type 'RouteLink'
8. `src/runtime/composables/app/routes/useAppUserRoutes.ts(45,9)`: TS2741 - Property 'to' is missing in type '{ id: string; label: string; icon: string; children: RouteLink[]; }' but required in type 'RouteLink'

### App Composables (8)

9. `src/runtime/composables/app/useAppOnboarding.ts(4,10)`: TS6133 - 'useRuntimeConfig' is declared but its value is never read
10. `src/runtime/composables/app/useAppOnboarding.ts(5,1)`: TS6133 - 'useCoreUser' is declared but its value is never read
11. `src/runtime/composables/app/useAppSubscriptionSetup.ts(16,5)`: TS6133 - 'appId' is declared but its value is never read
12. `src/runtime/composables/app/useAppUpdate.ts(2,26)`: TS6133 - 'setDoc' is declared but its value is never read
13. `src/runtime/composables/app/useAppUpdate.ts(2,34)`: TS6133 - 'collection' is declared but its value is never read
14. `src/runtime/composables/app/useEnsureApp.ts(54,63)`: TS2339 - Property 'join' does not exist on type '{}'
15. `src/runtime/composables/app/useEnsureApp.ts(78,9)`: TS2698 - Spread types may only be created from object types
16. `src/runtime/composables/app/utils/useEditHandler.ts(44,34)`: TS6133 - 'options' is declared but its value is never read
17. `src/runtime/composables/app/utils/useEditHandler.ts(47,32)`: TS6133 - 'options' is declared but its value is never read

### AppUser Subscription Issues (17)

18. `src/runtime/composables/firestore/AppUser/useAppUserComputed.ts(28,47)`: TS2339 - Property 'subscription' does not exist on type 'AppUser'
19. `src/runtime/composables/firestore/AppUser/useAppUserComputed.ts(42,22)`: TS2339 - Property 'subscription' does not exist on type 'AppUser'
20. `src/runtime/composables/firestore/AppUser/useAppUserComputed.ts(43,22)`: TS2339 - Property 'subscription' does not exist on type 'AppUser'
21. `src/runtime/composables/firestore/AppUser/useAppUserEnsure.ts(128,9)`: TS2353 - Object literal may only specify known properties, and 'uid' does not exist in type 'Partial<AppUser>'
22. `src/runtime/composables/firestore/AppUser/useAppUserSubscription.ts(11,23)`: TS2339 - Property 'subscription' does not exist on type 'AppUser'
23. `src/runtime/composables/firestore/AppUser/useAppUserSubscription.ts(12,22)`: TS2339 - Property 'subscription' does not exist on type 'AppUser'
24. `src/runtime/composables/firestore/AppUser/useAppUserSubscription.ts(13,22)`: TS2339 - Property 'subscription' does not exist on type 'AppUser'
25. `src/runtime/composables/firestore/AppUser/useAppUserSubscription.ts(18,22)`: TS2339 - Property 'subscription' does not exist on type 'AppUser'
26. `src/runtime/composables/firestore/AppUser/useAppUserSubscription.ts(19,22)`: TS2339 - Property 'subscription' does not exist on type 'AppUser'
27. `src/runtime/composables/firestore/AppUser/useAppUserSubscription.ts(24,22)`: TS2339 - Property 'subscription' does not exist on type 'AppUser'
28. `src/runtime/composables/firestore/AppUser/useAppUserSubscription.ts(25,22)`: TS2339 - Property 'subscription' does not exist on type 'AppUser'
29. `src/runtime/composables/firestore/AppUser/useAppUserSubscription.ts(30,22)`: TS2339 - Property 'subscription' does not exist on type 'AppUser'
30. `src/runtime/composables/firestore/AppUser/useAppUserSubscription.ts(31,22)`: TS2339 - Property 'subscription' does not exist on type 'AppUser'
31. `src/runtime/composables/firestore/AppUser/useAppUserSubscription.ts(36,22)`: TS2339 - Property 'subscription' does not exist on type 'AppUser'
32. `src/runtime/composables/firestore/AppUser/useAppUserSubscription.ts(37,22)`: TS2339 - Property 'subscription' does not exist on type 'AppUser'
33. `src/runtime/composables/firestore/AppUser/useAppUserSubscription.ts(42,25)`: TS2339 - Property 'subscription' does not exist on type 'AppUser'
34. `src/runtime/composables/firestore/AppUser/useAppUserSubscription.ts(43,23)`: TS2339 - Property 'subscription' does not exist on type 'AppUser'
35. `src/runtime/composables/firestore/AppUser/useAppUserSubscription.ts(44,26)`: TS2339 - Property 'subscription' does not exist on type 'AppUser'
36. `src/runtime/composables/firestore/AppUser/useAppUserSubscription.ts(71,26)`: TS2339 - Property 'subscription' does not exist on type 'AppUser'
37. `src/runtime/composables/firestore/AppUser/useAppUserSubscription.ts(75,26)`: TS2339 - Property 'subscription' does not exist on type 'AppUser'
38. `src/runtime/composables/firestore/AppUser/useAppUserSubscription.ts(79,26)`: TS2339 - Property 'subscription' does not exist on type 'AppUser'

### Blog Objects (5)

39. `src/runtime/composables/firestore/objects/Blog/useBlogPostUtils.ts(33,26)`: TS2339 - Property 'uid' does not exist on type 'AppUser & { readonly id: string; }'
40. `src/runtime/composables/firestore/objects/Blog/useCreateBlogPostState.ts(18,5)`: TS2739 - Type 'Promise<Author>' is missing the following properties from type 'Author': id, display_name, avatar
41. `src/runtime/composables/firestore/objects/Blog/useCreateBlogPostState.ts(44,7)`: TS2739 - Type 'Promise<Author>' is missing the following properties from type 'Author': id, display_name, avatar
42. `src/runtime/composables/firestore/objects/Blog/useCreateBlogPostState.ts(57,7)`: TS2739 - Type 'Promise<Author>' is missing the following properties from type 'Author': id, display_name, avatar
43. `src/runtime/composables/firestore/objects/Blog/utils/useBlogFormatting.ts(83,26)`: TS2339 - Property 'uid' does not exist on type 'AppUser & { readonly id: string; }'

### Product Objects - Missing Module (8)

44. `src/runtime/composables/firestore/objects/Product/Prices/useCreatePricesState.ts(7,8)`: TS2307 - Cannot find module '../../../../../models/product.model' or its corresponding type declarations
45. `src/runtime/composables/firestore/objects/Product/useCreateProductState.ts(9,8)`: TS2307 - Cannot find module '../../../../models/product.model' or its corresponding type declarations
46. `src/runtime/composables/firestore/objects/Product/useCreateProductState.ts(11,1)`: TS6133 - 'Ref' is declared but its value is never read
47. `src/runtime/composables/firestore/objects/Product/useCreateProductState.ts(12,1)`: TS6133 - 'useProducts' is declared but its value is never read
48. `src/runtime/composables/firestore/objects/Product/useCreateProductState.ts(51,7)`: TS6133 - 'collectionName' is declared but its value is never read
49. `src/runtime/composables/firestore/objects/Product/useProducts.ts(2,45)`: TS2307 - Cannot find module '../../../../models/product.model' or its corresponding type declarations
50. `src/runtime/composables/firestore/objects/Product/utils/useProductFormatting.ts(4,8)`: TS2307 - Cannot find module '../../../../../models/product.model' or its corresponding type declarations
51. `src/runtime/composables/firestore/objects/Product/utils/useProductValidation.ts(1,38)`: TS2307 - Cannot find module '../../../../../models/product.model' or its corresponding type declarations

### Product Formatting - Any Types (5)

52. `src/runtime/composables/firestore/objects/Product/utils/useProductFormatting.ts(40,51)`: TS7006 - Parameter 'img' implicitly has an 'any' type
53. `src/runtime/composables/firestore/objects/Product/utils/useProductFormatting.ts(129,13)`: TS7006 - Parameter 'p' implicitly has an 'any' type
54. `src/runtime/composables/firestore/objects/Product/utils/useProductFormatting.ts(130,14)`: TS7006 - Parameter 'a' implicitly has an 'any' type
55. `src/runtime/composables/firestore/objects/Product/utils/useProductFormatting.ts(130,17)`: TS7006 - Parameter 'b' implicitly has an 'any' type
56. `src/runtime/composables/firestore/objects/Product/utils/useProductFormatting.ts(157,38)`: TS7006 - Parameter 'feature' implicitly has an 'any' type

### Firestore Core (3)

57. `src/runtime/composables/firestore/objects/useObject.ts(25,25)`: TS2304 - Cannot find name 'computed'
58. `src/runtime/composables/firestore/useFirestoreDelete.ts(9,9)`: TS6133 - 'appId' is declared but its value is never read
59. `src/runtime/composables/firestore/useFirestoreDelete.ts(14,5)`: TS6133 - 'opts' is declared but its value is never read

### Model Issues (1)

60. `src/runtime/models/objects/blogPost.model.ts(2,32)`: TS2307 - Cannot find module './protocols' or its corresponding type declarations

### Server API Issues (7)

61. `src/runtime/server/api/app.get.ts(3,42)`: TS6133 - 'event' is declared but its value is never read
62. `src/runtime/server/api/app/env-check.ts(3,36)`: TS6133 - 'event' is declared but its value is never read
63. `src/runtime/server/api/firestore/update-document.post.ts(128,16)`: TS2304 - Cannot find name 'defineEventHandler'
64. `src/runtime/server/api/firestore/update-document.post.ts(128,42)`: TS7006 - Parameter 'event' implicitly has an 'any' type
65. `src/runtime/server/api/firestore/update-document.post.ts(141,24)`: TS2304 - Cannot find name 'readBody'
66. `src/runtime/server/api/firestore/update-document.post.ts(153,13)`: TS2304 - Cannot find name 'createError'
67. `src/runtime/server/api/firestore/update-document.post.ts(190,11)`: TS2304 - Cannot find name 'createError'

### Stripe API Version Issues (2)

68. `src/runtime/server/api/stripe/create-product.post.ts(7,3)`: TS2322 - Type '"2025-06-30.basil"' is not assignable to type '"2025-08-27.basil"'
69. `src/runtime/server/api/stripe/create-subscription.post.ts(39,7)`: TS2322 - Type '"2025-06-30.basil"' is not assignable to type '"2025-08-27.basil"'

---

## **2. fireux-jobs Package (26 errors)**

**Location**: `/packages/extensions/fireux-jobs`

### Cross-Package File Reference Issues (13)

70. `../../core/fireux-core/src/runtime/composables/firestore/objects/useObject.ts(2,33)`: TS6307 - File 'useObjectCreate.ts' is not listed within the file list of project
71. `../../core/fireux-core/src/runtime/composables/firestore/objects/useObject.ts(3,33)`: TS6307 - File 'useObjectDelete.ts' is not listed within the file list of project
72. `../../core/fireux-core/src/runtime/composables/firestore/objects/useObject.ts(4,33)`: TS6307 - File 'useObjectUpdate.ts' is not listed within the file list of project
73. `../../core/fireux-core/src/runtime/composables/firestore/objects/useObject.ts(25,25)`: TS2304 - Cannot find name 'computed'
74. `../../core/fireux-core/src/runtime/composables/firestore/objects/useObjectCreate.ts(9,8)`: TS6307 - File 'object.model.ts' is not listed within the file list of project
75. `../../core/fireux-core/src/runtime/composables/firestore/useFirestoreCreate.ts(9,33)`: TS6307 - File 'FireUXConfig.ts' is not listed within the file list of project
76. `../../core/fireux-core/src/runtime/composables/firestore/useFirestoreDelete.ts(9,9)`: TS6133 - 'appId' is declared but its value is never read
77. `../../core/fireux-core/src/runtime/composables/firestore/useFirestoreDelete.ts(14,5)`: TS6133 - 'opts' is declared but its value is never read
78. `../../core/fireux-core/src/runtime/composables/firestore/useFirestoreManager.ts(3,34)`: TS6307 - File 'useFirestoreRead.ts' is not listed within the file list of project
79. `../../core/fireux-core/src/runtime/composables/firestore/useFirestoreManager.ts(4,36)`: TS6307 - File 'useFirestoreCreate.ts' is not listed within the file list of project
80. `../../core/fireux-core/src/runtime/composables/firestore/useFirestoreManager.ts(5,36)`: TS6307 - File 'useFirestoreUpdate.ts' is not listed within the file list of project
81. `../../core/fireux-core/src/runtime/composables/firestore/useFirestoreManager.ts(6,36)`: TS6307 - File 'useFirestoreDelete.ts' is not listed within the file list of project
82. `../../core/fireux-core/src/runtime/composables/firestore/useFirestoreUpdate.ts(5,35)`: TS6307 - File 'useFirestoreUtils.ts' is not listed within the file list of project

### Config Issues (2)

83. `src/config/components-config.ts(9,52)`: TS6133 - 'options' is declared but its value is never read
84. `src/config/pages-config.ts(9,47)`: TS6133 - 'nuxt' is declared but its value is never read

### Route Issues (1)

85. `src/runtime/composables/app/routes/useJobRoutes.ts(2,32)`: TS6307 - File 'routeLink.ts' is not listed within the file list of project

### Job Object Issues (4)

86. `src/runtime/composables/firestore/objects/Job/useJobCreate.ts(1,37)`: TS6307 - File 'useFirestoreManager.ts' is not listed within the file list of project
87. `src/runtime/composables/firestore/objects/Job/useJobCreate.ts(37,13)`: TS2740 - Type missing properties 'title, description, company, location, and 6 more'
88. `src/runtime/composables/firestore/objects/Job/useJobs.ts(1,27)`: TS6307 - File 'useObject.ts' is not listed within the file list of project

### Profile Update Issues (4)

89. `src/runtime/composables/firestore/profiles/Employer/useEmployerUpdate.ts(43,14)`: TS2304 - Cannot find name 'useFirestore'
90. `src/runtime/composables/firestore/profiles/Employer/useEmployerUpdate.ts(44,34)`: TS2304 - Cannot find name 'useFirestoreUtils'
91. `src/runtime/composables/firestore/profiles/Professional/useProfessionalUpdate.ts(11,14)`: TS2304 - Cannot find name 'useFirestore'
92. `src/runtime/composables/firestore/profiles/Professional/useProfessionalUpdate.ts(12,34)`: TS2304 - Cannot find name 'useFirestoreUtils'

### Model Property Issues (1)

93. `src/runtime/composables/profiles/useEmployerFilters.ts(18,39)`: TS2339 - Property 'business_name' does not exist on type 'Employer'

### Model Path Issues (2)

94. `src/runtime/models/objects/Job.model.ts(1,38)`: TS2307 - Cannot find module '../../../../../fireux-core/src/runtime/models/objects/object.model'
95. `src/runtime/models/profiles/Employer.model.ts(4,8)`: TS6307 - File 'profile.model.ts' is not listed within the file list of project

---

## **3. fireux-misebox Package (47 errors)**

**Location**: `/packages/tenants/fireux-misebox`

### Cross-Package Reference Issues (2)

96. `../../extensions/fireux-jobs/src/runtime/composables/app/routes/useJobRoutes.ts(2,32)`: TS6307 - File 'routeLink.ts' is not listed within the file list of project
97. `src/runtime/composables/app/routes/useMiseboxRoutes.ts(1,30)`: TS6307 - File 'useJobRoutes.ts' is not listed within the file list of project

### TypeScript Config Issues (3)

98. `src/config/components-config.ts(6,10)`: TS1484 - 'Resolver' is a type and must be imported using a type-only import when 'verbatimModuleSyntax' is enabled
99. `src/config/components-config.ts(10,3)`: TS6133 - 'options' is declared but its value is never read
100.  `src/config/composables-config.ts(6,10)`: TS1484 - 'Resolver' is a type and must be imported using a type-only import when 'verbatimModuleSyntax' is enabled

### Core Import Issue (1)

101. `src/runtime/composables/firestore/core/useMiseApp.ts(3,24)`: TS2307 - Cannot find module 'fireux-core/runtime/composables/app/useApp'

### Unused Parameters (2)

102. `src/runtime/composables/firestore/objects/ingredients/useIngredient.ts(15,19)`: TS6133 - 'id' is declared but its value is never read
103. `src/runtime/composables/firestore/objects/ingredients/useIngredient.ts(61,17)`: TS6133 - 'id' is declared but its value is never read

### Chef Model Property Issues (6)

104. `src/runtime/composables/firestore/profiles/Chef/utils/useChefValidation.ts(234,18)`: TS2339 - Property 'chef_experience' does not exist on type 'Partial<Chef>'
105. `src/runtime/composables/firestore/profiles/Chef/utils/useChefValidation.ts(236,18)`: TS2339 - Property 'chef_experience' does not exist on type 'Partial<Chef>'
106. `src/runtime/composables/firestore/profiles/Chef/utils/useChefValidation.ts(243,18)`: TS2339 - Property 'certifications' does not exist on type 'Partial<Chef>'
107. `src/runtime/composables/firestore/profiles/Chef/utils/useChefValidation.ts(245,18)`: TS2339 - Property 'certifications' does not exist on type 'Partial<Chef>'
108. `src/runtime/composables/firestore/profiles/Chef/utils/useChefValidation.ts(275,18)`: TS2339 - Property 'hourly_rate' does not exist on type 'Partial<Chef>'
109. `src/runtime/composables/firestore/profiles/Chef/utils/useChefValidation.ts(276,20)`: TS2339 - Property 'hourly_rate' does not exist on type 'Partial<Chef>'

### Supplier Model Property Issues (11)

110. `src/runtime/composables/firestore/profiles/Supplier/utils/useSupplierValidation.ts(15,19)`: TS2339 - Property 'uid' does not exist on type 'Partial<Supplier>'
111. `src/runtime/composables/firestore/profiles/Supplier/utils/useSupplierValidation.ts(46,18)`: TS2339 - Property 'website' does not exist on type 'Partial<Supplier>'
112. `src/runtime/composables/firestore/profiles/Supplier/utils/useSupplierValidation.ts(46,50)`: TS2339 - Property 'website' does not exist on type 'Partial<Supplier>'
113. `src/runtime/composables/firestore/profiles/Supplier/utils/useSupplierValidation.ts(51,18)`: TS2339 - Property 'years_in_business' does not exist on type 'Partial<Supplier>'
114. `src/runtime/composables/firestore/profiles/Supplier/utils/useSupplierValidation.ts(52,20)`: TS2339 - Property 'years_in_business' does not exist on type 'Partial<Supplier>'
115. `src/runtime/composables/firestore/profiles/Supplier/utils/useSupplierValidation.ts(52,54)`: TS2339 - Property 'years_in_business' does not exist on type 'Partial<Supplier>'
116. `src/runtime/composables/firestore/profiles/Supplier/utils/useSupplierValidation.ts(58,18)`: TS2339 - Property 'employee_count' does not exist on type 'Partial<Supplier>'
117. `src/runtime/composables/firestore/profiles/Supplier/utils/useSupplierValidation.ts(59,20)`: TS2339 - Property 'employee_count' does not exist on type 'Partial<Supplier>'
118. `src/runtime/composables/firestore/profiles/Supplier/utils/useSupplierValidation.ts(65,18)`: TS2339 - Property 'payment_terms' does not exist on type 'Partial<Supplier>'
119. `src/runtime/composables/firestore/profiles/Supplier/utils/useSupplierValidation.ts(65,44)`: TS2339 - Property 'payment_terms' does not exist on type 'Partial<Supplier>'
120. `src/runtime/composables/firestore/profiles/Supplier/utils/useSupplierValidation.ts(75,37)`: TS2339 - Property 'payment_terms' does not exist on type 'Partial<Supplier>'
121. `src/runtime/composables/firestore/profiles/Supplier/utils/useSupplierValidation.ts(76,10)`: TS7006 - Parameter 'term' implicitly has an 'any' type

### Ingredient Model Property Issues (18)

122. `src/runtime/composables/objects/useIngredientFilters.ts(23,47)`: TS2339 - Property 'description' does not exist on type 'Ingredient'
123. `src/runtime/composables/objects/useIngredientFilters.ts(26,40)`: TS2339 - Property 'tags' does not exist on type 'Ingredient'
124. `src/runtime/composables/objects/useIngredientFilters.ts(26,52)`: TS7006 - Parameter 'tag' implicitly has an 'any' type
125. `src/runtime/composables/objects/useIngredientFilters.ts(29,46)`: TS2339 - Property 'categories' does not exist on type 'Ingredient'
126. `src/runtime/composables/objects/useIngredientFilters.ts(29,64)`: TS7006 - Parameter 'cat' implicitly has an 'any' type
127. `src/runtime/composables/objects/useIngredientFilters.ts(46,22)`: TS2339 - Property 'category' does not exist on type 'Ingredient'
128. `src/runtime/composables/objects/useIngredientFilters.ts(47,22)`: TS2339 - Property 'categories' does not exist on type 'Ingredient'
129. `src/runtime/composables/objects/useIngredientFilters.ts(53,40)`: TS2339 - Property 'allergens' does not exist on type 'Ingredient'
130. `src/runtime/composables/objects/useIngredientFilters.ts(53,57)`: TS7006 - Parameter 'allergen' implicitly has an 'any' type
131. `src/runtime/composables/objects/useIngredientFilters.ts(60,48)`: TS2339 - Property 'organic' does not exist on type 'Ingredient'
132. `src/runtime/composables/objects/useIngredientFilters.ts(65,49)`: TS2339 - Property 'seasonal' does not exist on type 'Ingredient'
133. `src/runtime/composables/objects/useIngredientFilters.ts(70,46)`: TS2339 - Property 'local' does not exist on type 'Ingredient'
134. `src/runtime/composables/objects/useIngredientFilters.ts(82,22)`: TS2339 - Property 'category' does not exist on type 'Ingredient'
135. `src/runtime/composables/objects/useIngredientFilters.ts(82,58)`: TS2339 - Property 'category' does not exist on type 'Ingredient'
136. `src/runtime/composables/objects/useIngredientFilters.ts(83,18)`: TS2339 - Property 'categories' does not exist on type 'Ingredient'
137. `src/runtime/composables/objects/useIngredientFilters.ts(83,39)`: TS7006 - Parameter 'cat' implicitly has an 'any' type
138. `src/runtime/composables/objects/useIngredientFilters.ts(91,18)`: TS2339 - Property 'allergens' does not exist on type 'Ingredient'
139. `src/runtime/composables/objects/useIngredientFilters.ts(91,38)`: TS7006 - Parameter 'allergen' implicitly has an 'any' type

### Model Import Issues (3)

140. `src/runtime/models/objects/Recipe.model.ts(1,38)`: TS2307 - Cannot find module 'fireux-core/src/runtime/models/objects/object.model'
141. `src/runtime/models/profiles/Chef.model.ts(4,8)`: TS6307 - File 'profile.model.ts' is not listed within the file list of project
142. `src/runtime/models/profiles/Supplier.model.ts(4,8)`: TS2307 - Cannot find module '../core-types'

---

## **4. fireux-places Package (19 errors)**

**Location**: `/packages/extensions/fireux-places`

### Config Unused Variables (7)

143. `src/config/components-config.ts(5,1)`: TS6133 - 'resolve' is declared but its value is never read
144. `src/config/components-config.ts(9,3)`: TS6133 - 'options' is declared but its value is never read
145. `src/config/composables-config.ts(8,3)`: TS6133 - 'options' is declared but its value is never read
146. `src/config/models-config.ts(5,3)`: TS6133 - 'resolver' is declared but its value is never read
147. `src/config/models-config.ts(6,3)`: TS6133 - 'options' is declared but its value is never read
148. `src/config/runtime-config.ts(5,3)`: TS6133 - 'resolver' is declared but its value is never read
149. `src/module.ts(41,24)`: TS6133 - 'nuxt' is declared but its value is never read

### Google Places API Issues (11)

150. `src/runtime/composables/useGooglePlaces.ts(1,21)`: TS2307 - Cannot find module 'vue'
151. `src/runtime/composables/useGooglePlaces.ts(42,27)`: TS2304 - Cannot find name 'google'
152. `src/runtime/composables/useGooglePlaces.ts(49,10)`: TS7006 - Parameter 'predictions' implicitly has an 'any' type
153. `src/runtime/composables/useGooglePlaces.ts(49,23)`: TS7006 - Parameter 'status' implicitly has an 'any' type
154. `src/runtime/composables/useGooglePlaces.ts(51,24)`: TS2304 - Cannot find name 'google'
155. `src/runtime/composables/useGooglePlaces.ts(54,73)`: TS7006 - Parameter 'p' implicitly has an 'any' type
156. `src/runtime/composables/useGooglePlaces.ts(79,27)`: TS2304 - Cannot find name 'google'
157. `src/runtime/composables/useGooglePlaces.ts(95,10)`: TS7006 - Parameter 'place' implicitly has an 'any' type
158. `src/runtime/composables/useGooglePlaces.ts(95,17)`: TS7006 - Parameter 'status' implicitly has an 'any' type
159. `src/runtime/composables/useGooglePlaces.ts(96,26)`: TS2304 - Cannot find name 'google'

### Places Composables Issues (2)

160. `src/runtime/composables/usePlaces.ts(1,31)`: TS2307 - Cannot find module 'vue'
161. `src/runtime/composables/usePlaces.ts(5,3)`: TS6196 - 'PlaceAutocompleteResult' is declared but never used

---

## **5. fireux-cleanbox Package (7 errors)**

**Location**: `/packages/tenants/fireux-cleanbox`

### Config Unused Variables (4)

162. `src/config/components-config.ts(10,3)`: TS6133 - 'options' is declared but its value is never read
163. `src/config/models-config.ts(4,33)`: TS6133 - 'resolver' is declared but its value is never read
164. `src/config/models-config.ts(4,53)`: TS6133 - 'nuxt' is declared but its value is never read
165. `src/config/pages-config.ts(4,32)`: TS6133 - 'resolver' is declared but its value is never read
166. `src/config/pages-config.ts(4,52)`: TS6133 - 'nuxt' is declared but its value is never read

### Route File Reference Issues (2)

167. `src/runtime/composables/app/routes/useCleanboxDevRoutes.ts(1,32)`: TS6307 - File 'routeLink.ts' is not listed within the file list of project
168. `src/runtime/composables/app/routes/useCleanboxRoutes.ts(1,30)`: TS6307 - File 'useJobRoutes.ts' is not listed within the file list of project

---

## **Summary by Error Category**

### **Critical Module Resolution (24 errors)**

- Missing `product.model` module (8 errors in fireux-core)
- Cannot find `useApp` module (1 error in fireux-misebox)
- Cannot find `vue` module (2 errors in fireux-places)
- Wrong path mappings (13 errors across packages)

### **Missing Model Properties (41 errors)**

- AppUser `subscription` property (17 errors in fireux-core)
- AppUser `uid` property (3 errors in fireux-core)
- Chef model properties (6 errors in fireux-misebox)
- Supplier model properties (11 errors in fireux-misebox)
- Ingredient model properties (18 errors in fireux-misebox)
- Employer `business_name` property (1 error in fireux-jobs)

### **TypeScript Configuration Issues (34 errors)**

- Project file list issues (13 errors in fireux-jobs)
- Type-only import issues (2 errors in fireux-misebox)
- Unused variables/parameters (19 errors across all packages)

### **API/Server Issues (15 errors)**

- Missing Nuxt server functions (4 errors in fireux-core)
- Missing Stripe API version (2 errors in fireux-core)
- Missing Google Places API (9 errors in fireux-places)

### **Type Definition Issues (54 errors)**

- Missing required properties (8 errors)
- Implicit any types (13 errors)
- Promise/return type mismatches (3 errors)
- Missing composable imports (4 errors)
- Route object property issues (2 errors)
- Spread type issues (1 error)
- Object literal property issues (1 error)

**TOTAL: 168 TypeScript Errors**
