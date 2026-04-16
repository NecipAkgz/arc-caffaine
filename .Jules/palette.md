2024-04-16 - Missing ARIA Labels on Icon-Only Modal and Refresh Buttons
Learning: Found a common pattern where icon-only buttons (like modal close 'X' buttons or refresh action icons) lack proper screen-reader labels. While some had `title` attributes, they were missing dedicated `aria-label`s for robust accessibility.
Action: Always verify that any button containing only an icon (e.g., `<X />`, `<RefreshCw />`) includes an `aria-label` attribute clearly describing its action.
