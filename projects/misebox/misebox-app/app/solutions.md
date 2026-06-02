# Misebox Solutions

## digital-restaurant-menu

Publish a digital restaurant menu from kitchen-owned menu data.

Current state: Misebox has public kitchen and menu routes backed by kitchen menu, section, item, and dish records.

Roadmap: make digital menus the easiest first step into Misebox. A kitchen should be able to create its profile, add dishes, group them into menu sections, publish the menu, and share the public URL.

Use this when a restaurant needs an online menu that is more structured than a PDF and easier to maintain than a static webpage.

### How this comes to life

1. Create or claim the kitchen record.
2. Add dishes with names, descriptions, prices, and public-ready details.
3. Create menu sections and attach dishes as menu items.
4. Publish the menu to the public kitchen URL.
5. Keep the public menu updated from the kitchen console.

### Business case

Restaurants need an online menu that is easier to maintain than a static webpage or PDF. This is the first wedge into Misebox because public menu data can later connect inward to dishes, allergens, recipes, prep, suppliers, translations, and hiring.

### Provisioning

- Kitchen record with public slug.
- Published menu record.
- Menu sections and dish-backed menu items.
- Public kitchen and menu routes.
- Console path for menu updates.

### Checklist

- [x] Confirm public kitchen slug route works.
- [ ] Confirm menu publish status controls visibility.
- [ ] Confirm menu sections and items render from records.
- [ ] Confirm dish-backed item names and descriptions appear.
- [ ] Add clear QR or share action after public menu is ready.

## qr-menu

Upload a menu, choose a short path, and get a QR menu.

Current state: Misebox owns the structured public menu route. Go QR can own lightweight QR generation when a menu only needs a scannable entry point.

Roadmap: add a native QR action on published menus and keep the Go QR bridge for lightweight or standalone QR needs.

Use this for tables, windows, flyers, event menus, hotel rooms, counter signs, and temporary menus.

### How this comes to life

1. Publish the menu at a stable public URL.
2. Generate a QR code for the exact menu URL.
3. Provide download and print actions for the QR code.
4. Show the QR code in the kitchen console and public menu admin path.
5. Bridge to Go QR when the customer only needs a simple QR destination.

### Business case

QR menus are a recognizable search problem and a simple customer entry point. Misebox should own the structured menu destination, while Go QR can own lightweight QR generation and standalone scannable links.

### Provisioning

- Published public menu URL.
- QR code generation or Go QR handoff.
- Download and print action.
- Console visibility for the QR target.
- Stable menu URL policy.

### Checklist

- [ ] Confirm the published menu URL is stable.
- [ ] Add menu QR action in the kitchen console.
- [ ] Add download and print output.
- [ ] Decide native QR generation versus Go QR handoff.

## restaurant-menu-management

Manage restaurant menu sections, dishes, prices, status, and public presentation in one workflow.

Current state: Misebox has a kitchen console menu flow with menu records, sections, items, dishes, and public menu publishing.

Roadmap: make menu management the central operating object that connects public presentation to dishes, recipes, allergens, prep, suppliers, and translations.

Use this when the menu changes often and the team needs one source of truth instead of scattered documents.

### How this comes to life

1. Create the kitchen and menu records.
2. Add sections and attach dish-backed items.
3. Manage item order, price, visibility, and menu status.
4. Preview the public menu before sharing.
5. Connect dishes to recipes, allergens, prep, and supplier context over time.

### Business case

Menu drift is a core restaurant operations problem. The customer searches for menu management, but the deeper value is one source of truth for public presentation and kitchen operations.

### Provisioning

- Kitchen console menu routes.
- Menu, section, item, and dish records.
- Price, visibility, status, and sort controls.
- Public preview route.
- Links to recipes, allergens, prep, and suppliers.

### Checklist

- [x] Confirm menu, section, item, and dish records exist.
- [ ] Confirm menu edit flow covers price, status, and order.
- [ ] Confirm public preview matches console state.
- [ ] Add links from menu items to recipe and allergen work.

## restaurant-menu-builder

Build a restaurant menu from dishes, sections, prices, and public presentation settings.

Current state: Misebox already has create flows for menus and console surfaces for building menu structure.

Roadmap: turn the menu builder into a guided workflow for new kitchens: kitchen identity, dish entry, section grouping, pricing, publish status, and public preview.

Use this when a restaurant wants to move from a static file into structured menu data.

### How this comes to life

1. Start a new menu from the kitchen console.
2. Choose the menu name, service mode, and publication status.
3. Add sections such as starters, mains, drinks, specials, or lunch.
4. Attach dishes and prices to each section.
5. Publish the menu when the public preview is ready.

### Business case

Restaurants often start with a menu file but need a builder when the menu becomes operational data. This route should engage customers who search for a practical menu builder before they understand Misebox's deeper operating model.

### Provisioning

- Guided menu creation flow.
- Section writer.
- Dish picker or dish create path.
- Price and public presentation fields.
- Publish and preview controls.

### Checklist

- [ ] Add guided create path for a new menu.
- [ ] Add section creation during menu setup.
- [ ] Add dish picker or inline dish creation.
- [ ] Add publish and preview step before completion.

## allergen-menu-software

Connect allergen and dietary information to dishes and public menu display.

Current state: allergen-aware menus are a planned extension of the dish, ingredient, and public menu workflow.

Roadmap: store allergen and dietary facts on dishes and ingredients, then show the right guest-facing information on public menus with review controls.

Use this when guests need clear allergen or dietary information and the kitchen needs that information connected to real menu data.

### How this comes to life

1. Add allergen and dietary fields to dishes and ingredients.
2. Review how ingredient allergens roll up into public dish information.
3. Display allergen labels or notes on public menus.
4. Add review and update controls before menu publication.
5. Keep allergen data connected when recipes, ingredients, or dishes change.

### Business case

Allergen information is high-trust menu data. Misebox can win by connecting allergen display to the actual dish, ingredient, and recipe system instead of leaving it as manual menu text.

### Provisioning

- Dish allergen and dietary fields.
- Ingredient allergen fields.
- Allergen rollup or review workflow.
- Public menu allergen display.
- Change review when ingredients or recipes update.

### Checklist

- [ ] Confirm allergen fields on dishes.
- [ ] Confirm ingredient allergen shape.
- [ ] Decide rollup versus manual review.
- [ ] Add public menu allergen display.

## multilingual-restaurant-menu

Publish restaurant menus in more than one language.

Current state: Misebox has language settings and public menu language work. Sproochli owns the deeper translation-ready public page workflow.

Roadmap: connect kitchen language settings, dish translations, public menu chrome, and Sproochli so multilingual menus can be created, reviewed, cached, and published.

Use this when guests need to understand a menu in their own language.

### How this comes to life

1. Set the kitchen source language and public languages.
2. Add translated dish names, descriptions, and menu chrome where available.
3. Use copy packs for reusable public menu interface text.
4. Bridge translation work to Sproochli when the menu needs a language workflow.
5. Publish the multilingual menu with a visible language selector.

### Business case

Multilingual menus are a real customer search intent, especially in tourism and hospitality. Misebox owns menu truth, while Sproochli should become the language workflow for translated public pages and menu chrome.

### Provisioning

- Kitchen source language and public language settings.
- Dish and menu translation fields or cache.
- Public menu language selector.
- Copy pack resolution.
- Sproochli bridge for translation workflow.

### Checklist

- [x] Confirm kitchen language settings exist.
- [ ] Confirm public menu language selector.
- [ ] Confirm dish translation cache/fields.
- [ ] Add Sproochli handoff for translation review.

## recipe-management-software

Store kitchen recipes with yields, ingredient lines, steps, and dish links.

Current state: Misebox has kitchen-scoped recipe records and console surfaces for recipe operations.

Roadmap: make recipes the bridge between dishes, ingredients, prep, costing, supplier needs, and service consistency.

Use this when recipes live in notebooks, spreadsheets, files, or team memory and need to become reusable kitchen knowledge.

### How this comes to life

1. Create recipe records in the selected kitchen.
2. Add yield, ingredient lines, and preparation steps.
3. Link recipes to dishes where they support public or internal menu items.
4. Use recipes to inform prep tasks and ingredient needs.
5. Keep recipes updated when the kitchen changes method, portion, or supplier.

### Business case

Recipes are where kitchen knowledge becomes reusable. This solution engages teams searching for recipe software, then connects those recipes to dishes, ingredients, prep, and supplier needs.

### Provisioning

- Kitchen-scoped recipe records.
- Recipe console routes.
- Yield, ingredient line, and step fields.
- Dish-to-recipe links.
- Prep and ingredient integration points.

### Checklist

- [x] Confirm kitchen-scoped recipe records.
- [ ] Confirm recipe create/edit route.
- [ ] Confirm dish-to-recipe linking.
- [ ] Add prep and ingredient integration points.

## kitchen-prep-planner

Plan prep work by station, recipe, menu, assignment, and service readiness.

Current state: Misebox has kitchen mise task records and console surfaces for prep operations.

Roadmap: make prep planning station-aware and menu-aware, with assignment, status, dependencies, timing, and service readiness views.

Use this when the kitchen needs to know what must be ready before service starts.

### How this comes to life

1. Create prep tasks for the selected kitchen.
2. Attach station, owner, timing, and status.
3. Link prep tasks to recipes, dishes, or menu needs where useful.
4. Review readiness before service.
5. Carry unfinished or recurring prep forward in a controlled way.

### Business case

Prep planning is a kitchen manager problem stated in practical language. Misebox should make prep visible, assignable, and connected to menu and recipe knowledge.

### Provisioning

- Mise task records.
- Station and owner fields.
- Task status and due timing.
- Links to recipes, dishes, menus, or service periods.
- Readiness view.

### Checklist

- [x] Confirm mise task records exist.
- [ ] Add station and owner filters.
- [ ] Add due timing and service readiness view.
- [ ] Link prep tasks to recipes, dishes, or menus.

## restaurant-prep-list

Give the team a daily prep list tied to tasks, status, stations, and service.

Current state: Misebox can represent prep as kitchen mise tasks and display them in console surfaces.

Roadmap: add a focused daily prep list view for teams, with filters for station, status, owner, due time, and service period.

Use this when the team needs a simple list to execute, not a complex planning screen.

### How this comes to life

1. Pull open prep tasks for the active kitchen.
2. Sort them by station, status, due time, or service priority.
3. Let operators update completion state.
4. Keep the view readable on kitchen-friendly devices.
5. Connect recurring prep patterns when the same tasks repeat.

### Business case

The prep list is the execution-facing version of prep planning. It should be simple enough for service teams while still backed by structured Misebox tasks.

### Provisioning

- Daily task query.
- Station, owner, status, and due-time filters.
- Completion controls.
- Mobile/kitchen-friendly display.
- Recurring task support.

### Checklist

- [ ] Add daily prep list query.
- [ ] Add station, owner, and status filters.
- [ ] Add completion controls.
- [ ] Check mobile/kitchen display.

## kitchen-team-management

Manage kitchen roles, stations, access, and team responsibilities.

Current state: Misebox has kitchen team concepts and operator access rules, but deeper team management is still planned.

Roadmap: create a team console that connects team members, roles, stations, permissions, prep assignments, and service responsibilities.

Use this when the operator needs clear accountability inside the kitchen.

### How this comes to life

1. Add team members to the kitchen.
2. Assign roles, stations, and capability tags.
3. Connect team members to prep, service, or management responsibilities.
4. Respect operator access rules for console permissions.
5. Use team data to support handover and service readiness.

### Business case

Kitchen operations depend on clear responsibility. This solution should engage operators searching for team management, then connect people to stations, prep, permissions, and service accountability.

### Provisioning

- Kitchen team records.
- Station records.
- Role and capability fields.
- Operator permission rules.
- Assignment links to prep and service workflows.

### Checklist

- [ ] Confirm kitchen team record shape.
- [ ] Add role and station fields.
- [ ] Confirm operator permission rules.
- [ ] Connect people to prep/service assignments.

## restaurant-supplier-management

Connect suppliers, ingredients, items, sourcing, and kitchen needs.

Current state: Misebox has supplier and ingredient concepts, plus kitchen supplier surfaces. The deeper sourcing workflow is planned.

Roadmap: connect supplier records to kitchen ingredient needs, product catalog data, pricing, availability, and ordering signals.

Use this when supplier information is scattered across messages, calls, invoices, and spreadsheets.

### How this comes to life

1. Add supplier records and kitchen supplier links.
2. Connect ingredients to preferred suppliers where useful.
3. Add product or catalog data as the supplier workflow matures.
4. Use ingredient needs from recipes, prep, and menus to inform sourcing.
5. Bridge deeper supplier commerce to the supplier/product modules.

### Business case

Supplier management becomes valuable when it connects to the kitchen's actual ingredient and menu needs. Misebox should avoid generic CRM language and focus on restaurant sourcing.

### Provisioning

- Supplier records.
- Kitchen supplier links.
- Ingredient records and preferred supplier links.
- Product/catalog bridge.
- Future ordering or availability signals.

### Checklist

- [x] Confirm supplier records exist.
- [ ] Confirm kitchen supplier link flow.
- [ ] Link ingredients to preferred suppliers.
- [ ] Decide product/catalog bridge point.

## restaurant-hiring-software

Publish hospitality roles and connect kitchens with chefs and professionals.

Current state: Misebox includes jobs and professional profile routes through the hospitality jobs stack.

Roadmap: make hiring part of the kitchen operating context: role needs, kitchen profile, team gaps, professional proof, and contact.

Use this when a restaurant needs staff who fit the actual kitchen and service model.

### How this comes to life

1. Create a job record linked to the kitchen or place.
2. Publish the role with clear title, type, and context.
3. Let professionals present profiles that show experience and fit.
4. Connect the role to the public kitchen identity.
5. Support contact or application flow as the hiring workflow matures.

### Business case

Hiring is stronger when it is connected to kitchen identity, role context, and professional proof. This solution should engage restaurants searching for hiring tools while keeping Misebox's operational context visible.

### Provisioning

- Job records.
- Kitchen or place links.
- Professional and chef profile routes.
- Public job pages.
- Contact or application path.

### Checklist

- [x] Confirm job records and routes.
- [ ] Confirm job-to-kitchen linking.
- [ ] Confirm public job page copy.
- [ ] Add contact or application path.

## chef-profile-page

Create a public chef profile that shows experience, roles, and kitchen fit.

Current state: Misebox includes chef and professional profile surfaces.

Roadmap: make profiles useful for real hiring and collaboration, with experience, roles, kitchens, proof, availability, and contact paths.

Use this when a chef or hospitality professional needs more than a CV.

### How this comes to life

1. Create or ensure the user profile.
2. Add chef or professional profile details.
3. Show experience, role history, skills, and kitchen context.
4. Publish the profile where it can be discovered.
5. Connect profiles to jobs and kitchen hiring needs.

### Business case

Chefs and hospitality professionals need a profile that shows real capability, not just a CV. Misebox profiles should create better hiring context for both professionals and kitchens.

### Provisioning

- Core user profile.
- Chef profile record.
- Professional profile record where relevant.
- Public profile route.
- Links to jobs, kitchens, and experience.

### Checklist

- [x] Confirm profile records exist.
- [ ] Confirm public chef profile route.
- [ ] Add proof, role, and experience fields.
- [ ] Link profiles to jobs and kitchens.

## restaurant-profile-page

Show a kitchen, menu, location, team identity, and hiring context.

Current state: Misebox has public kitchen routes and public menu routes backed by kitchen records.

Roadmap: make restaurant profiles useful for guests, professionals, suppliers, and operators: concept, location, menu, jobs, team, and public-to-private operator bridge.

Use this when the kitchen needs a public identity that is connected to operations, not just marketing copy.

### How this comes to life

1. Create or claim the kitchen record.
2. Add place identity, slug, image, short address, and concept copy.
3. Publish menus and link them from the profile.
4. Show jobs, supplier context, or operator bridge where appropriate.
5. Keep public identity connected to the kitchen console.

### Business case

A restaurant profile is valuable when it is connected to operational truth: menu, location, hiring, and operator ownership. It should be more durable than a marketing-only page.

### Provisioning

- Kitchen record with slug.
- Place/location data.
- Kitchen image and concept copy.
- Menu links.
- Jobs and operator bridge where appropriate.

### Checklist

- [x] Confirm public kitchen slug route.
- [ ] Confirm place and location display.
- [ ] Add menu links to profile.
- [ ] Add jobs and operator bridge where useful.

## restaurant-operations-software

Run menus, dishes, recipes, prep, team, suppliers, orders, and hiring from one kitchen console.

Current state: Misebox has many of the runtime pieces in place across kitchen console surfaces, public routes, jobs, suppliers, and profiles.

Roadmap: make the full operating console feel like one system: public menu, internal prep, recipe knowledge, team accountability, supplier context, orders, and hiring.

Use this when the restaurant or hospitality group needs one operating model across the kitchen, not isolated tools.

### How this comes to life

1. Start with a kitchen record and operator access.
2. Publish menus and dishes from kitchen-owned data.
3. Add recipes, prep tasks, team members, suppliers, and jobs.
4. Connect public pages to the console workflow.
5. Use the same operating model across more kitchens as the group grows.

### Business case

This is the full Misebox thesis: one operating model for restaurant menus, prep, team, suppliers, hiring, and service readiness. It should engage higher-intent operators and groups once the smaller solution wedges prove the value.

### Provisioning

- Kitchen console entry and access rules.
- Menus, dishes, recipes, mise, team, suppliers, orders, and jobs.
- Public routes connected to console data.
- Multi-kitchen operating model.
- App and subscription paths for rollout.

### Checklist

- [x] Confirm kitchen console entry.
- [ ] Confirm major modules appear as one operating system.
- [ ] Add cross-links between public routes and console workflows.
- [ ] Define multi-kitchen rollout path.
