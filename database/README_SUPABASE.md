Supabase schema and setup notes for LFC Legal Appointment System

Overview
- This folder contains `supabase_schema.sql` — a PostgreSQL schema mirror of the current app model for Supabase (Auth + RLS policies).
- The live runtime in this repository still uses Prisma + MySQL; this is the Supabase/PostgreSQL deployment path.

Quick setup
1. Create a Supabase project and copy the `supabase` service URL and keys.
2. In the Supabase SQL editor, run the contents of `supabase_schema.sql` to create tables and policies.
3. In your application, after a user signs up via Supabase Auth, create a `profiles` row for them (role defaults to `client`).
4. Use server-side (service role) operations for admin tasks like assigning roles, creating lawyers, or seeding data.

Security notes
- RLS is enabled on key tables and example policies are provided. Review and tailor policies for your deployment and any additional serverless functions.
- Never ship service role keys to the client. Use the service key only in trusted server environments.

Next steps (Phase 2)
- Build client-side signup/login and profile creation flow connecting to Supabase Auth.
- Implement server-side helpers (Edge Functions) for admin-only operations and complex queries (conflict detection helpers).
- If you keep the current Prisma/MySQL runtime, continue using the `server/` and `client/` app code in this repo unchanged.
