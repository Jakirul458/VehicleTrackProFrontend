# VehicleTrack Pro Frontend

React, Vite, TypeScript, and Tailwind CSS frontend. This directory is a standalone repository for deploying the app to Vercel.

## Tech Stack

- React 18 with React Router for routing
- Vite for build tooling
- TypeScript for type safety
- Tailwind CSS for styling
- shadcn/ui for UI components
- TanStack Query for server state management
- Axios for API communication
- React Hook Form + Zod for form validation
- Lucide React for icons

## Run locally

Requirements: Node.js 20 or newer.

```powershell
npm ci
npm run dev
```

Copy `.env.example` to `.env` and configure:
- `VITE_API_URL`: Backend API URL (default: http://localhost:5000/api)

The frontend uses JWT tokens stored in localStorage for authentication. The token is automatically included in Authorization headers for all API requests.

## Deploy to Vercel

1. Push the contents of this `frontend` folder to its own GitHub repository.
2. In Vercel, import that repository. The project root is the repository root.
3. Set the build command to `npm run build` and install command to `npm ci`.
4. Add the environment variable `VITE_API_URL` with your Render URL, for example `https://your-api.onrender.com/api`.
5. Add `VITE_SITE_URL` with the actual production website origin (for example, `https://your-project.vercel.app` or your custom domain, without a path). Vercel's `VERCEL_PROJECT_PRODUCTION_URL` is used if this is omitted. Builds fail rather than publishing a sitemap with an incorrect domain when neither is available.
6. Optionally set `VITE_GOOGLE_SITE_VERIFICATION` and `VITE_BING_SITE_VERIFICATION` to the verification values provided by Google Search Console and Bing Webmaster Tools. These are public verification tokens, not secrets.
7. Deploy. `VITE_API_URL`, `VITE_SITE_URL`, and verification values are read during the build, so redeploy after changing them.

The build generates static route HTML and page-specific titles, descriptions, canonical URLs, and social sharing metadata for the public About and Contact pages (so crawlers and link previews receive them without running JavaScript). It also generates `sitemap.xml` for the public Home, About, and Contact pages and adds its absolute URL to `robots.txt`. Login and signup pages are marked noindex; agent and admin routes are excluded from indexing.

After the production deployment is live, add the exact production URL/domain as a property in Google Search Console and Bing Webmaster Tools, verify ownership (DNS verification is preferred for a custom domain), then submit `https://YOUR_DOMAIN/sitemap.xml`. In Search Console, inspect the homepage and request indexing. Crawling and indexing are controlled by the search engines and can take days or weeks; inclusion or ranking for every search term cannot be guaranteed.

The API must allow the exact Vercel site origin through its `CLIENT_ORIGIN` setting. Do not add secrets or database credentials to frontend environment variables; `VITE_*` values are public in the browser.

## Project Structure

- `src/pages` - Page components organized by route (public, admin, agent, auth, errors)
- `src/layouts` - Layout components (PublicLayout, AdminLayout, AgentLayout)
- `src/components` - Reusable UI components
- `src/context` - React Context for authentication
- `src/api` - API layer with Axios and TanStack Query
- `src/types` - TypeScript type definitions
- `src/lib` - Utility functions

## Authentication

The app uses JWT-based authentication:
1. Login stores the JWT token in localStorage
2. Axios interceptors automatically add the token to Authorization headers
3. Protected routes check for valid authentication
4. 401 responses automatically redirect to login

## Features

### Public Pages
- Landing page with feature overview
- About page
- Contact page with form
- Login page
- Public agent signup with a seven-day trial

### Admin Pages (Super Admin only)
- Dashboard with platform statistics
- Agent management (CRUD operations)
- Activity log viewing
- Settings

### Agent Pages
- Dashboard with statistics
- Insurance, tax, and PUC record management
- Expiry reminders with prefilled Bengali WhatsApp messages and click-to-call actions
- Reports
- Profile settings

Agents can sign up for a seven-day trial or be created by the Super Admin. Super Admins configure monthly/yearly/lifetime prices and the QR, bank/UPI, WhatsApp, and email payment instructions from `/admin/settings`. After a trial or account validity expires, the login dialog links to the renewal page; confirm the payment slip before extending validity.