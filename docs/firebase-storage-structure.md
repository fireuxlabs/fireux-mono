# Firebase Storage Organization Structure

## Chef Profile Storage Structure

All chef-related files should be organized under `chefs/{chef_id}/` to maintain clear separation and easy management.

### Directory Structure

```
storage/
└── chefs/
    └── {chef_id}/                    # Chef's unique document ID
        ├── avatar.{ext}              # Main profile avatar
        ├── gallery/                  # Gallery images
        │   ├── {image_name}.{ext}
        │   └── ...
        ├── recipes/                  # Recipe images
        │   └── {recipe_id}/
        │       ├── main.{ext}        # Main recipe image
        │       ├── step_1.{ext}      # Cooking step images
        │       └── ...
        ├── portfolio/                # Portfolio/showcase images
        │   ├── portfolio_1.{ext}
        │   └── ...
        ├── certificates/             # Culinary certificates
        │   ├── {cert_name}.{ext}
        │   └── ...
        └── experience/               # Restaurant/venue logos
            ├── {venue_name}.{ext}
            └── ...
```

### Naming Conventions

- **Extensions**: Use web-optimized formats: `jpg`, `png`, `webp`
- **File Names**: Use lowercase with underscores: `main_dish.jpg`
- **Venue Names**: Sanitize special characters: `Le Bernardin` → `le_bernardin.jpg`
- **Sizes**: Store multiple sizes: `avatar.jpg`, `avatar_thumb.jpg`, `avatar_large.jpg`

### Storage Paths Examples

```javascript
// Avatar
chefs / PWu17mL3cTX9ia3OlAdI0Rux6Ek2 / avatar.jpg

// Gallery images
chefs / PWu17mL3cTX9ia3OlAdI0Rux6Ek2 / gallery / signature_dish.jpg
chefs / PWu17mL3cTX9ia3OlAdI0Rux6Ek2 / gallery / kitchen_setup.jpg

// Recipe images
chefs / PWu17mL3cTX9ia3OlAdI0Rux6Ek2 / recipes / beef_wellington / main.jpg
chefs / PWu17mL3cTX9ia3OlAdI0Rux6Ek2 / recipes / beef_wellington / step_1.jpg

// Portfolio
chefs / PWu17mL3cTX9ia3OlAdI0Rux6Ek2 / portfolio / fine_dining_1.jpg
chefs / PWu17mL3cTX9ia3OlAdI0Rux6Ek2 / portfolio / plating_technique.jpg

// Certificates
chefs / PWu17mL3cTX9ia3OlAdI0Rux6Ek2 / certificates / culinary_degree.pdf
chefs / PWu17mL3cTX9ia3OlAdI0Rux6Ek2 / certificates / food_safety.jpg

// Experience venue logos
chefs / PWu17mL3cTX9ia3OlAdI0Rux6Ek2 / experience / restaurant_abc.jpg
chefs / PWu17mL3cTX9ia3OlAdI0Rux6Ek2 / experience / hotel_xyz.png
```

### Storage Rules

```javascript
// Firebase Storage Security Rules
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Chef profile images
    match /chefs/{chefId}/{allPaths=**} {
      // Allow authenticated users to read
      allow read: if request.auth != null;

      // Allow chef to write their own files
      allow write: if request.auth != null
        && request.auth.uid == chefId;

      // Allow admins to write any chef files
      allow write: if request.auth != null
        && request.auth.token.admin == true;
    }
  }
}
```

### Migration Strategy

1. **Audit Current Storage**: Identify all existing chef images
2. **Create New Structure**: Organize images into proper directories
3. **Update URLs**: Update Firestore documents with new image URLs
4. **Cleanup**: Remove old, unorganized files
5. **Validate**: Ensure all images are accessible

### Implementation Notes

- Use Firebase Storage SDK for file operations
- Generate signed URLs for temporary access
- Implement image optimization (compression, resizing)
- Add metadata for better organization
- Set up lifecycle rules for automatic cleanup
