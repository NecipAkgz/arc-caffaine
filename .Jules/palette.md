## 2026-02-11 - Component Accessibility
**Learning:** Reusable components like `CreatorSearch` lack unique IDs for form controls and error messages, preventing proper `aria-describedby` linkage.
**Action:** Use React's `useId` hook to generate stable IDs for all interactive elements and their associated descriptions/errors.
