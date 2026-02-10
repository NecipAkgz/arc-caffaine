## 2024-05-22 - [Form Accessibility Pattern]
**Learning:** Using `useId` hook is essential for associating error messages (`aria-describedby`) in reusable components like `CreatorSearch` to avoid ID collisions when multiple instances exist (e.g., Navbar vs Mobile Menu).
**Action:** Always use `useId` for generating IDs for `aria-describedby` and `aria-labelledby` relationships in shared components.
