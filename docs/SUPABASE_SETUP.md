# Supabase Setup Guide

This repository currently runs with the existing Express + Prisma API.
To align with the Supabase architecture requirement, use this migration path.

## 1) Create Supabase Project

1. Create a new Supabase project.
2. Copy `Project URL` and `anon` / `service_role` keys.
3. Enable email/password auth in Authentication settings.

## 2) Apply Database Schema

Run [database/supabase_schema.sql](../database/supabase_schema.sql) in the Supabase SQL editor.

This creates:
- profiles, lawyers, clients, inquiries, appointments, appointment_timeline
- lawyer_availability, notifications, reports
- foreign keys, indexes, and Row Level Security (RLS) policies

## 3) Configure Role Bootstrapping

After first users sign up, insert profile rows and role assignments:

```sql
insert into public.profiles (id, role, full_name, email)
values ('<auth_user_uuid>', 'admin', 'System Admin', 'admin@lfcfirm.com');
```

Repeat for staff, lawyers, and clients as needed.

## 4) Conflict Detection Rules

Use app-side rule checks before insert/update on `appointments`:
- same lawyer + same date/time overlap => conflict
- lawyer marked unavailable/leave => block booking
- recurring slot collisions => suggest alternative
- workload beyond threshold => warning

You can also enforce overlap constraints with Postgres exclusion indexes in a later phase.

## 5) Realtime Notifications

Enable realtime on:
- `notifications`
- `appointments`

Then subscribe from client dashboards for status updates and reminders.

## 6) Environment Variables

For frontend-only Supabase mode:

```env
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
```

When both variables are set, the client uses Supabase Auth and realtime notifications.
When unset, the client stays on the existing Express API auth flow.

For server-assisted mode, add service role key to backend environment only.

## 7) Recommended Migration Phases

1. Auth + profiles on Supabase Auth
2. Inquiry and appointment tables + RLS
3. Availability + conflict checks
4. Notifications + realtime
5. Reports and print/PDF exports

This staged approach keeps the current UI intact while transitioning data and security to Supabase safely.
