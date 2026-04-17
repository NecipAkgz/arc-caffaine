2024-05-23 - [Dashboard Action Icons Missing ARIA Labels]
Learning: Action clusters with dense icon-only buttons (like in the dashboard) often omit `aria-label`s even if they have `title`s. While `title` provides tooltip hover context, it is inconsistently announced by screen readers compared to an explicit `aria-label`.
Action: When adding utility clusters of icons, ensure both `title` and `aria-label` are present to cover both mouse users (tooltips) and screen reader users (spoken labels).
