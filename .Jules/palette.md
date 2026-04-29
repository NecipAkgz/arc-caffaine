2024-04-29 - [Icon-Only Element Accessibility]
Learning: Several interactive elements (buttons and links) that only contain icons (e.g., Lucide icons) were relying solely on the `title` attribute for context. While `title` provides a tooltip on hover for mouse users, it is inconsistently announced by screen readers.
Action: Ensure all icon-only interactive elements in the application explicitly include an `aria-label` attribute alongside the `title` attribute to guarantee proper accessibility for assistive technologies.
