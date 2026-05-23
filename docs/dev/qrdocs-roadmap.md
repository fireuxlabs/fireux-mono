# QRdocs Roadmap

Authority: Operational
Updated: 2026-05-23

## Purpose

QRdocs is a standalone FireUX app for simple document hosting and QR sharing.

The current MVP is intentionally small:

- one upload
- one public document page
- one printable QR page
- no premium features today
- no AI processing today
- no private-document mode today

The product promise is:

> Upload a document. Get a public URL and QR code.

QRdocs must stay inside the FireUX mono repo patterns so the app can scale later without becoming a one-off.

## Product Model

Free version:

- each visitor/user can create one document
- the document is public to anyone with the link or QR code
- the page can be used as proof of concept and early product validation

Later paid version:

- more documents
- account-owned document dashboard
- private or restricted document access
- more branding controls
- analytics
- team/business ownership

Do not build premium features until the free one-document flow is stable.

## Release Checklist

1. Firebase Rules
   Lock direct client writes. Upload/create should go through the server API only. Public reads are allowed only for published docs.

2. Storage Rules
   No direct public uploads. Files should be written by the server/admin path and viewed through the QRdocs document route/API.

3. Public-Link Warning
   Make it explicit before upload: the free version creates a public link, so anyone with the link or QR can view the document.

4. Terms And Conditions
   Explain upload rights, public visibility, unacceptable content, removal rights, and that QRdocs is hosting only.

5. Privacy Copy
   Add a plain warning: do not upload private or sensitive documents unless public-link access is acceptable.

6. Auth/Profile Display
   Use FireUX core user profile by default for avatar and handle. Allow app overrides later only where needed.

7. Dashboard Basics
   Show the user's uploaded document, public URL, QR link, and status. Keep this tiny.

8. SEO
   Add app/product SEO for QRdocs. Uploaded documents should be noindex by default unless an explicit indexing choice is added later.

9. Product Page
   Add or confirm the QRdocs FireUX product entry: "Upload a document. Get a QR code."

10. Smoke Test
    Test upload, duplicate slug warning, public document page, QR page, logged-in state, anonymous state, mobile view, and deployed URL.

## First Item: Firebase Rules

QRdocs currently stores product data in the named Firestore database:

```txt
databaseId: qrdoc
collection: qrdoc_documents
```

The app creates documents through the server endpoint:

```txt
POST /api/docs/create
```

That is the correct release shape. The browser should not write directly to Firestore for document creation.

The app page should still call the QRdocs domain seam:

```txt
page/form
  -> useQrdocCreate()
      -> useFirestoreApiCreate()
          -> POST /api/docs/create
```

That mirrors the normal simple-write shape:

```txt
page/form
  -> useXCreate()
      -> useFirestoreCreate()
```

This keeps the consumer mostly ignorant when a create flow moves from simple to server-gated.

### Why This Matters

The one-free-document rule cannot be safely enforced if the browser can write directly to Firestore.

If direct writes are open, someone could bypass the upload form and create many records from the console or a script. Firebase Rules should therefore block client-side create, update, and delete for QRdocs document records.

The server API can still write because Firebase Admin bypasses Firestore client rules. That gives us one controlled gate where we can validate:

- slug format
- duplicate slug
- file size
- file type
- one-free-document limit
- future account/payment limits
- owner identity when accounts are introduced

### Recommended Firestore Rule Shape

For the `qrdoc` database, the release rule should be conceptually:

```js
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    match /qrdoc_documents/{documentId} {
      allow get: if resource.data.is_public == true;
      allow list: if false;
      allow create, update, delete: if false;
    }

    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

Important details:

- `create`, `update`, and `delete` are denied for clients.
- Public document metadata can be read only when `is_public == true`.
- Listing is denied by default so public users cannot browse every document directly through Firestore.
- The public `/docs/:slug` and `/docs/:slug/qr` routes can use server/API reads instead.
- Admin/dashboard mutations should also go through server endpoints, not direct Firestore writes.

If the app later needs client-side document lists, add a deliberate signed-in rule for owner-owned records, not a broad public list rule.

### What Firebase Rules Do Not Cover

Firestore rules do not protect files in Firebase Storage. Storage needs its own rule set.

For QRdocs, the safest matching model is:

- server/admin writes files into `qrdocs/documents/...`
- clients do not upload directly to Storage
- clients do not read Storage files directly
- public viewing goes through `/api/docs/:slug/file`
- the API checks the Firestore document exists and `is_public == true` before streaming the file

### Manual Firebase Setup Note

Current FireUX canon says app roots should not carry temporary `firestore.rules` files yet. Rules are managed manually per Firebase database until repo-managed rules are intentionally canonized.

Before release, confirm the rules are applied to the named database:

```txt
qrdoc
```

Do not only update `(default)`.

## Next Batch

Work through the checklist in order:

1. Confirm Firebase/Storage rules.
2. Add upload-page public-link warning.
3. Expand the QRdocs terms/proof document text if needed.
4. Fix FireUX profile display inside QRdocs.
5. Add SEO basics.
