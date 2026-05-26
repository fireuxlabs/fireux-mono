# Sproochli Solutions

## multilingual-qr-page-generator

Create one public page that people reach from a QR code, then let them choose the language they need.

Current state: Sproochli already has QR-friendly public information pages with language-aware routing and language choices.

Roadmap: make this a repeatable page generator with a clear create flow, source language, published languages, QR handoff, and a simple preview before publish.

Use this solution when the visitor starts from a physical place: a sign, counter card, rental desk, room, table, door, poster, or printed guide.

### How this comes to life

1. Choose the public information that should be reachable by QR code.
2. Publish the original page in the source language.
3. Attach approved or generated language versions.
4. Show the visitor a language selector on the public page.
5. Add a QR download or Go QR handoff when the page is ready to print.

## guest-instructions-translator

Translate guest instructions for stays, rooms, rentals, and visitor spaces.

Current state: Sproochli has BNB guide examples and can display guest-facing information as public pages.

Roadmap: connect this to structured guest guide content, then let hosts publish check-in notes, Wi-Fi, appliance instructions, house rules, parking, emergency notes, and local recommendations in multiple languages.

This is a Sproochli solution when the main job is translation. It should bridge to BuenoHost when the job needs property-aware guide management.

### How this comes to life

1. Start with the guest instructions in the host's source language.
2. Split the guide into sections visitors can scan and read quickly.
3. Add language versions for the languages guests most often need.
4. Publish the guide as a public page or connect it to a BuenoHost property guide.
5. Place the QR code where guests naturally need help.

## house-rules-translator

Translate house rules and venue rules so expectations are clear before there is a problem.

Current state: this can be served by the same public page pattern as guest instructions.

Roadmap: add a focused template for rules, quiet hours, access limits, checkout expectations, waste, pets, smoking, shared spaces, and local obligations.

This page should stay practical and calm: the goal is not legal language, it is making important rules understandable.

### How this comes to life

1. Write the house rules in plain source-language text.
2. Group rules into short sections that are easy to scan.
3. Add approved translations for the guest languages that matter.
4. Publish the public page and link it from the guest guide.
5. Review the translations whenever rules change.

## rental-instructions-translator

Translate rental instructions for bikes, rooms, equipment, vehicles, tools, lockers, or shared facilities.

Current state: Sproochli already has a bike rental instruction example under the public info page surface.

Roadmap: turn the example into a reusable rental-instruction template with pickup, usage, return, safety, payment, damage, and support sections.

This is useful anywhere the customer receives something physical and needs instructions without staff repeating the same explanation.

### How this comes to life

1. Capture the rental flow from pickup to return.
2. Add short instruction sections for use, safety, support, and return.
3. Translate the page into the languages renters commonly need.
4. Publish the public page and connect it to a QR code at the rental point.
5. Keep the page updated when the rental process changes.

## menu-translator

Publish read-only translated menu pages for restaurants, bars, cafes, pop-ups, and hospitality teams.

Current state: Sproochli has a menu area placeholder and the FireUX kitchen stack already has multilingual public menu work.

Roadmap: use Sproochli for simple read-only translated menu pages. Bridge to Misebox when the menu needs structured dishes, sections, allergens, prices, ordering, or kitchen operations.

This solution should avoid pretending to be a full menu management system. It is the translation-first entry point.

### How this comes to life

1. Start with the current public menu text or menu file.
2. Decide whether Sproochli can serve it as a simple read-only page.
3. Add language versions for dish names, descriptions, notes, and service information.
4. Publish the translated menu page and QR entry point.
5. Move the workflow to Misebox when the menu needs structured hospitality data.

## safety-notice-translator

Translate safety notices, warnings, emergency steps, access instructions, and equipment rules.

Current state: this is planned as a focused Sproochli page type.

Roadmap: add a safety notice template that separates urgent warnings, emergency contacts, step-by-step actions, location details, and supporting notes.

This should be used for public clarity, not as a replacement for legally required certified safety documentation.

### How this comes to life

1. Identify the safety information visitors must understand quickly.
2. Write the source-language notice in short, direct sections.
3. Add approved translations for the languages needed on site.
4. Publish the notice as a QR page and print it near the relevant place or equipment.
5. Review the page whenever safety procedures change.

## sign-and-notice-translator

Turn a physical sign, poster, counter card, door notice, or printed instruction into a multilingual QR page.

Current state: Sproochli can already use the public information page pattern for this.

Roadmap: create a lightweight sign flow where the owner enters the sign text, chooses languages, publishes the page, and prints a QR code beside the original sign.

This is the simplest Sproochli use case: one small public message, many possible readers.

### How this comes to life

1. Copy the sign or notice text into a Sproochli page.
2. Add the context visitors need to understand the message.
3. Attach translations for the target languages.
4. Publish the multilingual page and create a QR code for the sign.
5. Replace or update the printed QR when the notice changes.

## visitor-guide-translator

Translate local guides, recommendations, directions, parking notes, transit help, and visitor support information.

Current state: Sproochli can publish public guide-style pages today through info and BNB surfaces.

Roadmap: add guide sections for arrival, local recommendations, transport, parking, food, activities, accessibility, support, and common questions.

This belongs in Sproochli when translation is the main need. It should bridge to BuenoHost when the guide becomes property-aware and operational.

### How this comes to life

1. Write the visitor guide in the source language.
2. Split the guide into useful sections instead of one long page.
3. Add language versions for the visitor groups that matter.
4. Publish the guide and link it from signs, guest messages, or QR cards.
5. Move deeper hosting workflows into BuenoHost when the guide needs property tools.

## public-information-page-translator

Translate public-facing information pages for places, venues, services, and local operations.

Current state: this is the broad live Sproochli pattern behind the existing public info page example.

Roadmap: make the page type repeatable, with source content, language state, approved translations, cached generated translations, publication status, and QR handoff.

Use this when the information does not fit a narrower solution such as guest instructions, menu, rental instructions, or safety notices.

### How this comes to life

1. Create the source public information page.
2. Add sections that map to real visitor questions.
3. Attach translations and mark which ones are approved.
4. Publish the page with language selection.
5. Connect the page to QR, signage, app navigation, or a sibling FireUX app.

## certified-page-translation

Publish owner-approved or human-approved translations for public visitor pages.

Current state: Sproochli already names certified languages as part of the product direction, but the full approval workflow still needs to be built.

Roadmap: add translation status, reviewer notes, approval history, publish controls, and clear labels that distinguish original content, certified translations, and cached generated translations.

This page should be honest: certified means reviewed and approved for the page, not a generic legal guarantee.

### How this comes to life

1. Publish the source page and decide which languages need certification.
2. Create or import the translated text for each language.
3. Review and approve the translation before it becomes public.
4. Label the public page so visitors can tell which version is certified.
5. Re-review translations when the source page changes.
