2024-04-23 - Created journal
2024-04-23 - Accessibility of icon-only buttons
Learning: Identified a pattern in the app's components, particularly in the `dashboard/page.tsx`, where multiple interactive elements (such as `button`s and `a`/`Link`s) relied solely on visual icons without providing `aria-label`s. This pattern causes severe accessibility issues as screen readers won't convey their function.
Action: Implemented `aria-label` attributes on these elements and established a standard to always check for and enforce descriptive `aria-label`s when implementing icon-only buttons in the future.
