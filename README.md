# Thirumalai Engineering College — Online Admission Application Portal

React + Vite admission portal frontend for Thirumalai Engineering College.

---

## Directory & Naming Conventions

### Recommended Directory Convention: All-Lowercase Directory Names
To maintain consistency across cross-platform case-sensitive environments (e.g. Linux build servers on Render vs macOS/Windows local development), we recommend adopting **all-lowercase directory names** under `src/`:

- `src/api/` (API client services & HTTP handlers)
- `src/components/` (UI components & form renderers)
- `src/context/` (React auth & application state context)
- `src/pages/` (Route page components)
- `src/config/` (College configuration & static metadata)
- `src/assets/` (Static image assets and logos)

> **Architectural Note**: The project currently has a mix (`src/Api/` and `src/Config/` alongside `src/components/`, `src/context/`, `src/pages/`). Flagged for full repo-wide rename after team confirmation to avoid disruption during active feature deliveries.

---

## Environment Configuration

Define API base URL in `.env`:
```env
VITE_API_BASE_URL=https://server-thiru.onrender.com/api
```
