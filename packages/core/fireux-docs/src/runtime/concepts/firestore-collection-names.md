# Firestore Collection Names

Authority: Operational
Updated: 2026-05-25
Scope: Firestore collection ids used by FireUX runtime apps, packages, and scripts.

## Rule

Firestore collection ids should be one simple lowercase plural word.

Good:

```txt
apps
users
products
kitchens
documents
menus
dishes
ingredients
projects
```

Avoid:

```txt
go_qr_documents
qrdoc_documents
misebox_kitchens
fireux_products
```

## Why

The database, parent path, app config, and model own scope.

The collection name should describe the record family only. It should not repeat the app name, ecosystem name, package name, or product brand.

## Scope By Path

Use path position for scope:

```txt
documents/{documentId}
apps/{appId}/users/{uid}
kitchens/{kitchenId}/menus/{menuId}
kitchens/{kitchenId}/dishes/{dishId}
products/{productId}/prices/{priceId}
```

For standalone app databases, the database id already provides app scope:

```txt
database: go-qr
collection: documents
```

not:

```txt
database: go-qr
collection: go_qr_documents
```

## Exceptions

Multi-word ids are allowed only when a short plural word would be misleading or when the record is a support/cache family rather than a product/domain root.

Examples that may be acceptable when owned and documented by their package:

```txt
translation_cache
manual_sections
guest_messages
```

Do not use an exception for app branding. If the name contains an app or ecosystem id, it is probably wrong.

## Checklist

Before adding a collection:

1. Can the collection be named as one plural word?
2. Is app/ecosystem scope already supplied by the database or parent path?
3. Is this a real domain/root family, child family, or support/cache family?
4. If it needs more than one word, is the exception documented near the owning package?

If unsure, choose the simple plural name first and let the model/path carry the extra meaning.
