# Go QR Solutions

## public-doc-qr-code

Turn one public document into one scannable public page.

Current state: Go QR already supports the core upload flow for a public document, a stable short path, and QR-ready public access.

Roadmap: keep this as the main Go QR product promise. Strengthen the page with clearer file validation, preview, QR download, expiry controls, deletion, and simple sharing instructions.

Use this when the customer already has a finished document or piece of public information and only needs a clean QR entry point.

### How this comes to life

1. Upload the public document.
2. Choose the short public path people will scan.
3. Publish the hosted page at the public slug.
4. Generate and display the QR code for that page.
5. Add download, print, and manage actions around the QR record.

## url-qr-code

Turn an existing URL into a scannable QR code.

Current state: this is a very direct Go QR extension because the destination already exists outside Go QR.

Roadmap: add a URL input mode with validation, destination preview, QR generation, and optional title/label fields for managing saved QR records.

Use this when the customer wants a QR code for a website, booking page, form, product page, payment link, map, social profile, or any other existing web destination.

### How this comes to life

1. Paste the destination URL.
2. Validate that the URL is complete and safe to open.
3. Generate a QR code that points directly to the destination.
4. Let the user download or print the QR code.
5. Optionally save the QR record with a label for later management.

## pdf-qr-code

Upload a PDF and give people a QR code that opens it.

Current state: this is already close to the public document flow because PDF is one of the most common public document formats.

Roadmap: make PDF handling feel first-class with PDF-specific validation, preview, file naming, page title, and print-friendly QR output.

Use this for menus, notices, terms, policies, forms, guides, instructions, event sheets, and other finished PDFs.

### How this comes to life

1. Upload the PDF.
2. Check that the file is public-safe and displayable.
3. Choose a short public path.
4. Publish the PDF page and generated QR code.
5. Add a clear path to replace the PDF when the document changes.

## wifi-qr-code

Create a QR code that lets guests join a Wi-Fi network.

Current state: this is a very easy QR type but still needs its own input form and generated payload format.

Roadmap: add fields for network name, password, security type, hidden network setting, and a print-friendly output for rooms, counters, offices, rentals, and event spaces.

Use this when the problem is repeated Wi-Fi questions and typing errors.

### How this comes to life

1. Enter the network name.
2. Enter the password and security type.
3. Generate the Wi-Fi QR payload.
4. Preview instructions for where to place it.
5. Download or print the QR code for the physical space.

## phone-call-qr-code

Create a QR code that starts a phone call.

Current state: this is a simple QR payload type and can be implemented without hosting a document.

Roadmap: add a phone number form with country-aware validation, display label, optional business name, and QR output for signs, desks, cards, and support notices.

Use this when the best action after scanning is calling a business, host, venue, support desk, or emergency contact.

### How this comes to life

1. Enter the phone number.
2. Normalize and validate the number.
3. Generate a tel link QR code.
4. Show a preview of the call action.
5. Download or print the QR code where people need it.

## whatsapp-qr-code

Create a QR code that opens a WhatsApp chat.

Current state: this is a very easy QR type once Go QR has a dedicated contact-link input mode.

Roadmap: add fields for WhatsApp number or invite link, optional starter message, display label, and QR output.

Use this for support, bookings, quick questions, local business contact, group joins, event coordination, and visitor help.

### How this comes to life

1. Enter the WhatsApp number or invite link.
2. Optionally add a starter message.
3. Validate the final WhatsApp URL.
4. Generate the QR code.
5. Place it on a sign, table card, flyer, receipt, or help page.

## map-pin-qr-code

Create a QR code that opens a location or map pin.

Current state: this is a very easy QR type if the user brings a map URL or coordinates.

Roadmap: add support for coordinates, map URLs, place labels, pickup notes, and preferred map destination where useful.

Use this for hidden venues, temporary event entrances, pickup points, rural stays, parking spaces, meeting points, and delivery spots.

### How this comes to life

1. Enter coordinates, an address, or a map URL.
2. Add a short place label or arrival note.
3. Build the map destination link.
4. Generate the QR code.
5. Put the QR code on directions, confirmations, posters, or pickup instructions.

## vcard-qr-code

Create a QR code that saves contact details.

Current state: this needs a structured contact form and vCard payload generation.

Roadmap: add fields for name, company, role, phone, email, website, address, and notes, then generate a vCard QR that can be saved by common phone contact apps.

Use this for business cards, reception desks, service contacts, events, sales teams, support contacts, and public contact sheets.

### How this comes to life

1. Enter the contact details.
2. Generate a vCard payload.
3. Preview the saved-contact information.
4. Create the QR code.
5. Download it for cards, signs, desks, or printed material.

## event-info-qr-code

Create a QR code for event details, timing, location, or instructions.

Current state: this can begin as a hosted public information page, similar to public document QR, then become a focused event page type.

Roadmap: add fields for title, date, time, location, joining notes, schedule, contact, and updates. Later, connect this to calendar files or event-specific public pages.

Use this for small events, pop-ups, meetings, tours, classes, workshops, performances, and one-off public notices.

### How this comes to life

1. Add the event title, time, location, and key details.
2. Publish a simple event information page.
3. Generate the QR code for the event page.
4. Share it on posters, tickets, tables, signs, or screens.
5. Update the page if event details change.

## review-link-qr-code

Create a QR code that sends customers to a review page.

Current state: this is a very easy link QR type, but the UX should explain good placement and honest review use.

Roadmap: add a review URL input, platform label, QR output, and optional print text for counters, receipts, rooms, checkout cards, or follow-up material.

Use this when the customer already has a Google, Tripadvisor, booking, marketplace, or platform review destination.

### How this comes to life

1. Paste the review destination URL.
2. Label the review platform.
3. Generate the QR code.
4. Add simple print copy that asks for feedback clearly.
5. Place the QR where happy customers naturally finish the experience.

## feedback-form-qr-code

Create a QR code that opens a feedback or survey form.

Current state: this can launch as a URL QR for existing forms and later grow into a Go QR-owned lightweight feedback page.

Roadmap: support pasted form URLs first. Later, add a simple feedback page builder with a few question types, response storage, and export.

Use this for guest feedback, customer surveys, event feedback, staff checklists, issue reports, and quick service follow-up.

### How this comes to life

1. Paste an existing form URL or create a lightweight feedback page.
2. Add a label that explains what feedback is being collected.
3. Generate the QR code.
4. Place it where the response moment happens.
5. Review whether the flow should stay a link QR or become a Go QR feedback page.

## booking-link-qr-code

Create a QR code that opens a booking or appointment link.

Current state: this is a very easy link QR type for businesses that already use booking software.

Roadmap: add a booking URL input, business label, optional service label, destination preview, and QR output for posters, table cards, flyers, signs, and receipts.

Use this when Go QR should connect the physical world to an existing booking system rather than own the booking workflow.

### How this comes to life

1. Paste the booking or appointment URL.
2. Validate the destination.
3. Add a short label for the service or location.
4. Generate the QR code.
5. Place it where people decide to book.

## food-menu-qr-code

Create a QR code for a food menu.

Current state: Go QR can host a finished menu file today. This is enough when the menu is a static PDF or document.

Roadmap: make the simple menu upload path explicit, then bridge to Misebox when the menu needs structured dishes, sections, prices, allergens, translations, availability, or ordering.

Use this for cafes, restaurants, bars, pop-ups, food trucks, events, and temporary menus that only need a scannable public file.

### How this comes to life

1. Upload the finished menu file.
2. Choose a public path for the menu.
3. Generate the QR code for tables, windows, flyers, or signs.
4. Replace the file when the static menu changes.
5. Move to Misebox when the menu needs structured hospitality data.

## guest-guide-qr-code

Create a QR code for guest instructions, house rules, Wi-Fi, and local notes.

Current state: Go QR can host a simple guest guide document. That is enough for a single finished file.

Roadmap: keep Go QR as the lightweight document route and bridge to BuenoHost when the guide should become editable, reusable, property-aware, or operational.

Use this for apartments, BNBs, hotels, cabins, serviced rooms, event spaces, and rentals where guests need a single scannable guide.

### How this comes to life

1. Upload the finished guest guide document.
2. Publish it at a short public path.
3. Generate the QR code.
4. Print it where guests naturally need help.
5. Move to BuenoHost when the guide needs structured property tools.

## multilingual-qr-pages

Create QR pages for public information in more than one language.

Current state: Go QR owns the scannable public link. Sproochli owns the deeper translation and localisation workflow.

Roadmap: let Go QR bridge multilingual needs to Sproochli instead of building translation into the base QR product. Add a handoff from a Go QR page to a Sproochli multilingual page when language support becomes necessary.

Use this when the QR destination is useful, but visitors need language choice to understand the information.

### How this comes to life

1. Start with one Go QR public page or document.
2. Decide which visitor languages matter.
3. Move the public page content into Sproochli when translation is needed.
4. Publish the multilingual page with language selection.
5. Use the QR code to send visitors to the language-aware public page.
