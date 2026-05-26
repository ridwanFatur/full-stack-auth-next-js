# CLAUDE.md

## Project Overview

This project is a **clean, scalable, and minimal Next.js frontend** for a **FastAPI monolith backend** focused on **Google Authentication**.

Frontend responsibilities:

- Google login flow
- Authentication state management
- API communication
- Protected routes
- Shared layouts
- Clean UI architecture

Backend responsibilities:

- Verify Google OAuth token
- Create/update user in database
- Generate JWT access & refresh tokens
- Authentication management

---

## Tech Stack

Required stack:

- Next.js (App Router)
- TypeScript
- Tailwind CSS
- Axios

Rules:

- Use **Tailwind CSS only**
- Use **Axios only** for API requests
- Use **Google OAuth only**
- Keep implementation **clean and scalable**

Avoid unnecessary dependencies.

---

## Environment Variables

Frontend `.env`:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

Never hardcode URLs.

Always use:

```ts
process.env.NEXT_PUBLIC_API_URL
```

---

## Authentication Flow

Google OAuth redirect:

```txt
http://localhost:3000/redirect/login
```

Flow:

```txt
Login Page
    ↓
Google OAuth
    ↓
/redirect/login
    ↓
Send Google token to backend
    ↓
Backend verifies token
    ↓
Receive JWT tokens
    ↓
Store auth state
    ↓
Redirect to Home Page
```

Requirements:

- Google auth only
- No email/password login
- No other providers
- JWT-based authentication

---

## Pages

### Login Page

Route:

```txt
/login
```

Requirements:

- Clean UI
- Google Sign-In button
- Loading state
- Redirect authenticated users to `/`

---

### Redirect Login Page

Route:

```txt
/redirect/login
```

Purpose:

Handle Google OAuth callback.

Responsibilities:

1. Receive Google token
2. Send token to backend
3. Receive JWT tokens
4. Save auth session
5. Redirect to `/`

Requirements:

- Loading state
- Error handling
- Minimal UI

---

### Home Page

Route:

```txt
/
```

Requirements:

- Protected route
- Require authentication
- Redirect unauthenticated users to `/login`
- Use shared layout

---

## Folder Structure

Use this structure:

```txt
app/
├── login/
├── redirect/login/
├── page.tsx
├── layout.tsx

components/
├── auth/
├── layout/
├── ui/

lib/
├── api/
│   ├── axios.ts
│   └── cache.ts
├── auth/
└── utils/
```

Rules:

- Keep files small
- Reuse components
- Avoid large components
- Separate UI and logic

---

## Layout Rules

Use reusable layouts.

Requirements:

- Shared navigation
- Consistent spacing
- Minimal design
- Clean structure

UI should feel:

- Modern
- Clean
- Fast
- Minimal

Avoid clutter.

---

## Styling Rules

Use:

```txt
Tailwind CSS only
```

Guidelines:

- Consistent spacing
- Reusable utility classes
- Responsive design
- Minimal styling

**Button cursor rule (enforced):**

Every `<button>` element must include `cursor-pointer` in its Tailwind class list.

```tsx
// ✅ Correct
<button className="cursor-pointer ...">Click me</button>

// ❌ Wrong — missing cursor-pointer
<button className="...">Click me</button>
```

When a button is disabled, also add `disabled:cursor-not-allowed` so the cursor
changes correctly in the disabled state:

```tsx
<button
  disabled={loading}
  className="cursor-pointer ... disabled:cursor-not-allowed disabled:opacity-60"
>
  Submit
</button>
```

Avoid:

- Heavy animations
- Overly complex UI
- Deep component nesting

---

## API Rules

All requests must use a centralized Axios instance.

Create:

```txt
lib/api/axios.ts
```

Requirements:

- Base URL from env
- Request interceptors
- Response interceptors
- Token attachment
- Error handling

Example:

```ts
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
});
```

Never use raw `fetch()` directly.

---

## Request Caching

Create:

```txt
lib/api/cache.ts
```

Requirements:

- Lightweight request caching
- Prevent duplicate requests
- Improve performance
- Centralized implementation

Keep it simple.

Do not overengineer.

---

## Token Handling

Backend returns:

- Access token
- Refresh token

Requirements:

- Persist auth session
- Attach access token automatically
- Handle expiration
- Handle unauthorized responses

Keep auth flow clean.

---

## Error Handling

Must handle:

- Login failure
- Redirect failure
- API errors
- Unauthorized access

Never fail silently.

Provide graceful fallback UI.

---

## Code Standards

Requirements:

- TypeScript only
- Clean naming
- Reusable components
- Minimal architecture
- Centralized logic

Avoid:

- Hardcoded values
- Duplicate logic
- Massive files
- Unnecessary abstractions
- Business logic inside UI

---

## Development Rules

Before implementing:

1. Read existing structure
2. Reuse components
3. Keep implementation minimal
4. Follow folder conventions

Mindset:

```txt
Simple > Complex
Clean > Clever
Reusable > Duplicated
```