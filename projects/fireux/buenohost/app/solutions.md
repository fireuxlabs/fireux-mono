# BuenoHost Solutions

## guest-guide-qr-code

Give guests one QR-friendly guide for the information they need during a stay.

### How this comes to life

1. Create the property or stay guide.
2. Add guest-facing sections for arrival, Wi-Fi, rules, checkout, and local notes.
3. Publish the guide and connect it to a QR code.

### Business case

Hosts answer the same questions repeatedly. A digital guest guide reduces repeat messages and gives guests a reliable place to find stay information.

### Provisioning

- Property record.
- Public guide route.
- Stay guide sections.
- QR handoff through Go QR or native output.

### Checklist

- [ ] Confirm property guide route.
- [ ] Add guide section editor.
- [ ] Add QR/share action.
- [ ] Add public unavailable state.

## wifi-instructions-page

Publish Wi-Fi details and connection notes in a clean guest-facing page.

### How this comes to life

1. Add Wi-Fi name, password, and connection notes.
2. Publish the information inside the stay guide.
3. Place the QR code where guests need it.

### Business case

Wi-Fi is one of the most repeated guest questions. This page should make that information easy to find, update, and share.

### Provisioning

- Property Wi-Fi fields.
- Guest-facing Wi-Fi route or guide section.
- Optional Go QR Wi-Fi handoff.

### Checklist

- [ ] Add Wi-Fi section data shape.
- [ ] Add guest-safe display rules.
- [ ] Add QR placement copy.

## house-manual-qr-code

Turn house rules, appliances, parking, and checkout notes into a shareable guide.

### How this comes to life

1. Write the house manual in clear sections.
2. Publish it as part of the digital stay guide.
3. Share it before arrival and inside the property.

### Business case

House manuals often live in binders, PDFs, or messages. BuenoHost should make them editable, reusable, and property-aware.

### Provisioning

- House manual section templates.
- Property-specific public guide.
- QR/share action.

### Checklist

- [ ] Define default manual sections.
- [ ] Add edit flow.
- [ ] Add public preview.

## check-in-instructions-page

Create a simple page for arrival details, key pickup, entry codes, and timing.

### How this comes to life

1. Add arrival and access instructions.
2. Include timing, parking, and contact notes.
3. Publish the page before the guest arrives.

### Business case

Arrival friction creates stress for guests and hosts. Check-in instructions should be clear, mobile-friendly, and easy to update.

### Provisioning

- Check-in section data.
- Optional sensitive-field handling.
- Public guide section.

### Checklist

- [ ] Add check-in section fields.
- [ ] Decide sensitive code visibility rules.
- [ ] Add guest-ready preview.

## local-recommendations-guide

Share nearby places, tips, and host recommendations without repeatedly sending messages.

### How this comes to life

1. Add recommended places and notes.
2. Group them by food, transport, activities, or essentials.
3. Publish them inside the guest guide.

### Business case

Good recommendations improve the stay and reduce repeated host messaging. This should become a reusable local guide for each property.

### Provisioning

- Recommendation records or guide blocks.
- Place/category grouping.
- Public guide display.

### Checklist

- [ ] Define recommendation block shape.
- [ ] Add categories.
- [ ] Link to maps where useful.
