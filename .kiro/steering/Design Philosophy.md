---
inclusion: fileMatch
fileMatchPattern: ["**/*.tsx", "**/*.ts", "**/components/**/*", "**/app/**/*"]
---

# Design Philosophy & UI Standards

When creating or modifying UI components, follow these design principles and implementation standards:

## Core Design Principles

1. **Minimalist Design**: Clean layouts with purposeful white space
2. **Progressive Disclosure**: Show essential info first, expand for details
3. **Visual Hierarchy**: Clear information architecture and content flow
4. **Consistency**: Unified design language across all components

## Component Architecture

### File Organization

- Place components in `/components` directory
- Use descriptive, PascalCase naming
- Group related components in subdirectories (`/components/staff`, `/components/student`)
- Separate UI components (`/components/ui`) from feature components

### Component Structure

```tsx
// Use this pattern for all components
interface ComponentProps {
  // Define props with TypeScript
}

export function ComponentName({ prop1, prop2 }: ComponentProps) {
  // Component logic
  return <div className="space-y-4">{/* JSX with consistent spacing */}</div>;
}
```

### State Management Patterns

- Use local state for UI-only concerns
- Implement loading states with skeleton components
- Show error states with clear messaging
- Use optimistic updates for better UX

## UI Patterns

### Cards & Layouts

```tsx
<Card className="p-6">
  <CardHeader className="pb-4">
    <CardTitle>Title</CardTitle>
  </CardHeader>
  <CardContent className="space-y-4">{/* Content */}</CardContent>
</Card>
```

### Status Indicators

Use semantic colors and consistent badge/pill components:

### Forms

- Use consistent form field spacing: `space-y-4`
- Implement proper validation feedback
- Group related fields logically
- Use descriptive labels and helper text

### Responsive Design

- Mobile-first approach: `grid-cols-1 md:grid-cols-2 lg:grid-cols-3`
- Use responsive spacing: `p-4 md:p-6`
- Ensure touch-friendly interactions (min 44px touch targets)

## Animation Guidelines

- Use subtle transitions: `transition-all duration-200`
- Hover states: `hover:bg-gray-50`
- Focus states: `focus:ring-2 focus:ring-blue-500`
- Keep animations under 300ms

## Accessibility Requirements

- Use semantic HTML elements
- Implement proper ARIA labels
- Ensure keyboard navigation works
- Maintain color contrast ratios (4.5:1 minimum)
- Provide alternative text for images

## Code Quality Standards

- Use TypeScript for all components
- Implement proper prop validation
- Extract reusable logic into custom hooks
- Keep components focused and single-purpose
- Use composition over inheritance
