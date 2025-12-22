# Beta CRM Design System

This document outlines the design standards, color palette, typography, and component guidelines for the Beta CRM application.

## Color Palette

### Background Colors

```scss
$clr-light-bg: #fff;           // Light background (white)
$clr-card-footer-bg: #F5F5FA;  // Card footer background
$clr-body-bg: #F5F5FA;         // Body background
$clr-main-content-bg: #F5F5FA; // Main content area background
```

### Border Colors

```scss
$clr-base-border: #ececf3;     // Base border color
```

### Text Colors

```scss
$clr-muted-text: #8181A5;      // Muted/secondary text
```

### Legacy Colors

```scss
body {
    background-color: #f2f2f2;  // Note: This differs from $clr-body-bg
}
```

## Typography

### Font Family

```scss
font-family: "Inter", sans-serif;
```

**Primary Font**: Inter (sans-serif)

## Spacing & Utilities

### SCSS Functions

#### px-to-rem
Converts pixel values to rem units for scalable sizing:

```scss
@function px-to-rem($px) {
    @return ($px / 16) * 1rem;
}
```

**Usage**: `padding: px-to-rem(24);` → `padding: 1.5rem;`

### SCSS Mixins

#### Size Mixin
Sets width and height in one declaration:

```scss
@mixin size($w, $h) {
    width: $w;
    height: $h;
}
```

**Usage**: `@include size(20px, 20px);`

#### Display Mixin
Sets display property:

```scss
@mixin display($type) {
    // Supports: 'block', 'inline', 'grid', 'flex'
}
```

**Usage**: `@include display('flex');`

## Icons

All icons are 20x20px by default.

### Available Icons

#### Checkbox Icon
```scss
.checkbox-icon {
    background: url("../images/unchecked.svg") no-repeat center center transparent;
    @include size(20px, 20px)
}
```

#### Kanban Icon
```scss
.kanban-icon {
    background: url('../images/kanban/kanban-icon.svg') no-repeat center center transparent;
    @include size(20px, 20px)
}
```

## Component Guidelines

### Cards

- **Background**: Use `$clr-light-bg` for card bodies
- **Footer**: Use `$clr-card-footer-bg` for card footers
- **Borders**: Use `$clr-base-border` for card borders

### Layout

- **Main Content Area**: Use `$clr-main-content-bg`
- **Body**: Use `$clr-body-bg`

## File Structure

Design system files are located in:
```
client/scss/
├── partials/
│   ├── _vars.scss       # Color variables and design tokens
│   ├── _mixins.scss     # Reusable SCSS mixins and functions
│   ├── _task.scss       # Task component styles
│   ├── _kanban.scss     # Kanban board styles
│   └── _kanban-item.scss # Kanban item styles
├── _icons.scss          # Icon definitions
└── app.scss             # Main SCSS entry point
```

## Usage Guidelines

1. **Always use variables** for colors instead of hardcoding values
2. **Use the px-to-rem function** for sizing to ensure accessibility
3. **Use mixins** for common patterns to maintain consistency
4. **Keep icon sizes consistent** at 20x20px unless specified otherwise
5. **Follow the component structure** defined in the partials directory

## Notes

- There's a color discrepancy: `body { background-color: #f2f2f2; }` vs `$clr-body-bg: #F5F5FA;`
- Consider consolidating these values for consistency
