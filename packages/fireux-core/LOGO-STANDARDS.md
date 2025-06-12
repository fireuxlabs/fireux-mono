# Logo Standards for FireUX Apps

## Overview

All FireUX applications should follow consistent logo standards to ensure a cohesive user experience across the platform.

## Logo Requirements

### Size Standards

- **Header Logo**: Small size (32px height recommended)
- **Landing Pages**: Medium size (64px height recommended)
- **Large Displays**: Large size (128px height recommended)

### Format Requirements

- **File Format**: SVG preferred for scalability
- **Fallback**: PNG with transparent background
- **Color Modes**: Support both light and dark themes

### Dimensions

- **Aspect Ratio**: Maintain consistent aspect ratio across all sizes
- **Minimum Size**: 24px height (for smallest use cases)
- **Maximum Size**: 256px height (for hero sections)

### Placement Standards

- **Header**: Top-left corner
- **Mobile**: Always visible, even when mobile menu is open
- **Desktop**: Left-aligned with navigation centered

## Implementation

### Using FireLogoType Component

```vue
<template>
  <!-- Small size for headers -->
  <FireLogoType size="small" />

  <!-- Medium size for landing pages -->
  <FireLogoType size="medium" />

  <!-- Large size for hero sections -->
  <FireLogoType size="large" />
</template>
```

### Logo File Structure

```
public/
  logo/
    logo.svg          # Main logo (SVG)
    logo-light.svg    # Light theme variant
    logo-dark.svg     # Dark theme variant
    logo.png          # Fallback (PNG)
    favicon.ico       # Browser favicon
```

## Design Guidelines

### Visual Requirements

- **Clarity**: Logo must be readable at all specified sizes
- **Contrast**: Sufficient contrast against background colors
- **Simplicity**: Avoid overly complex designs that don't scale well

### Brand Consistency

- **Typography**: If logo includes text, use consistent font family
- **Colors**: Use brand colors defined in the design system
- **Spacing**: Maintain adequate white space around logo

## Mobile Considerations

### Mobile-First Design

- Logo remains visible and functional on all screen sizes
- Touch targets meet accessibility standards (minimum 44px)
- Responsive scaling based on viewport width

### Mobile Header Layout

```
[Logo] -------------------- [Avatar] [☰]
```

### Desktop Header Layout

```
[Logo] ------ [Navigation] ------ [Avatar]
```

## Developer Guidelines

### When Creating New Apps

1. Design logo following the size and format standards
2. Create all required variants (light/dark, different sizes)
3. Test logo visibility across all breakpoints
4. Ensure logo works with FireLogoType component
5. Add logo files to the correct directory structure

### Testing Checklist

- [ ] Logo displays correctly at small size (32px height)
- [ ] Logo maintains readability on mobile devices
- [ ] Logo works in both light and dark themes
- [ ] Logo has sufficient contrast against backgrounds
- [ ] Logo scales properly across all screen sizes
- [ ] Logo follows brand guidelines and visual hierarchy

## Accessibility

### Requirements

- **Alt Text**: Provide descriptive alt text for screen readers
- **Contrast**: Meet WCAG 2.1 AA contrast requirements
- **Focus States**: Ensure logo links have visible focus indicators

### Implementation

```vue
<FireLogoType size="small" alt="FireUX Application Logo" role="img" />
```

## Examples

### Good Logo Practices

- Simple, memorable design
- Scalable vector format
- Clear at small sizes
- Brand-consistent colors
- Appropriate contrast

### Common Mistakes to Avoid

- Overly complex designs that lose clarity when scaled down
- Poor contrast against backgrounds
- Inconsistent sizing across pages
- Missing dark theme variants
- Non-scalable raster formats for primary logo

## Support

For questions about logo implementation or design standards, refer to:

- FireUX Core documentation
- Design system guidelines
- Component library examples
