# Bihar Cyber Café Digital Service Portal

A web portal that lets a cyber café's customers apply for Bihar government services (certificates, education, banking, utilities) online — browse services, fill dynamic forms, upload documents, pay, and track applications — while operators and admins manage the backlog.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server
- `pnpm --filter @workspace/web run dev` — run the web frontend
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec (`lib/api-spec/openapi.yaml`)
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/db run seed` — seed categories, services, blog posts, and FAQs
- Required env/secrets: `DATABASE_URL`, `CLERK_SECRET_KEY`, `CLERK_PUBLISHABLE_KEY`, `VITE_CLERK_PUBLISHABLE_KEY`, `DEFAULT_OBJECT_STORAGE_BUCKET_ID`, `PRIVATE_OBJECT_DIR`, `PUBLIC_OBJECT_SEARCH_PATHS`

## Stack

- pnpm workspaces, Node.js, TypeScript
- API: Express 5, mounted under `/api`
- DB: PostgreSQL + Drizzle ORM (`lib/db/src/schema/`)
- Auth: Clerk (Replit-managed), proxied through the API server; roles (`customer`/`operator`/`admin`) mirrored into a local `users` table
- File uploads: Replit Object Storage (GCS-backed, presigned URLs)
- Validation: Zod, `drizzle-zod`
- API codegen: Orval (from `lib/api-spec/openapi.yaml`) — generates React Query hooks (`@workspace/api-client-react`) and Zod request/response schemas (`@workspace/api-zod`)
- Frontend: React + Vite (`artifacts/web`)

## Where things live

- `lib/api-spec/openapi.yaml` — source of truth for the API contract; run codegen after editing it
- `lib/db/src/schema/` — Drizzle tables, one file per entity (users, categories, services, applications, documents, payments, notifications, blogs, faqs, tickets)
- `lib/db/src/seed.ts` — seed data for categories/services/blogs/faqs
- `artifacts/api-server/src/routes/` — Express route handlers, one file per resource
- `artifacts/api-server/src/middlewares/auth.ts` — `requireAuth`/`requireRole` + Clerk JIT user provisioning
- `artifacts/api-server/src/routes/storage.ts`, `src/lib/objectStorage.ts`, `src/lib/objectAcl.ts` — object storage upload/serve endpoints
- `artifacts/web/src/App.tsx` — routing, Clerk provider, role-based home redirect

## Architecture decisions

- **Auth via Clerk, not custom OTP/JWT** — gives real email verification for free. New signups default to role `customer`; role changes go through an admin-only endpoint.
- **Admin bootstrap**: since no admin exists until someone signs up, the very first person to ever sign in is auto-promoted to `admin` (see `getOrCreateLocalUser` in `middlewares/auth.ts`). Every subsequent signup defaults to `customer`.
- **Payments are mocked** — `POST /api/applications/:id/pay` instantly marks an application as paid; there is no real payment gateway integration (by product decision, not a limitation).
- **File uploads use Replit Object Storage** (presigned PUT URLs), not base64-in-DB, per the object-storage skill.
- **Application tracking is public** but scoped: `GET /api/applications/track` requires both the application number and the applicant's registered email to prevent enumeration.

## Product

- Public: browse services by category, view service detail (price/turnaround/required documents), track an application by number + email, read blog posts and FAQs, submit a support ticket.
- Customer (signed in): submit applications with dynamic forms, upload required documents, pay (mock), view own applications/status history/notifications, submit/view own tickets.
- Operator: view all applications, advance application status with a note, respond to support tickets.
- Admin: aggregate stats dashboard, manage services/categories, manage blog posts and FAQs, manage users and their roles, manage all tickets.

## User preferences

_None recorded yet._

## Gotchas

- This workspace's installed `zod` version does not support `.url()` on generated Zod schemas via the orval codegen path — use a plain `string` type in the OpenAPI spec instead of `format: uri` for fields like presigned upload URLs.
- After changing `lib/db/src/schema/`, run `pnpm --filter @workspace/db run push`, then `pnpm -w run typecheck:libs` before typechecking `api-server` — otherwise stale `dist/*.d.ts` files make the new schema exports look missing.
- Orval generates request-body/query-param Zod schemas as `<OperationId>Body` / `<OperationId>QueryParams` (not named after the OpenAPI schema components) — check `lib/api-zod/src/generated/api.ts` for the actual export names before wiring routes.

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
