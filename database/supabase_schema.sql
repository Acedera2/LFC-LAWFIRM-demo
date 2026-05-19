-- Supabase PostgreSQL schema for LFC Legal Appointment System
-- Includes auth-linked profiles, role-based access, priority scheduling, conflict monitoring,
-- recurring consultation tracking, notifications, and reporting snapshots.

create extension if not exists "pgcrypto";

create type public.user_role as enum ('admin', 'lawyer', 'staff', 'client');
create type public.inquiry_status as enum ('submitted', 'reviewed', 'scheduled', 'completed');
create type public.appointment_priority as enum ('urgent', 'moderate', 'regular');
create type public.appointment_status as enum ('pending', 'scheduled', 'approved', 'rescheduled', 'completed', 'cancelled');
create type public.availability_status as enum ('available', 'occupied', 'unavailable', 'leave');

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role public.user_role not null default 'client',
  full_name text not null,
  email text not null unique,
  phone text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.lawyers (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null unique references public.profiles(id) on delete cascade,
  specialization text,
  status public.availability_status not null default 'available',
  max_daily_consultations integer not null default 8,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.clients (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null unique references public.profiles(id) on delete cascade,
  assigned_lawyer_id uuid references public.lawyers(id),
  status text not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.inquiries (
  id uuid primary key default gen_random_uuid(),
  client_profile_id uuid not null references public.profiles(id) on delete cascade,
  concern_type text not null,
  description text not null,
  urgency_level public.appointment_priority not null default 'regular',
  preferred_schedule timestamptz,
  status public.inquiry_status not null default 'submitted',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.appointments (
  id uuid primary key default gen_random_uuid(),
  inquiry_id uuid references public.inquiries(id) on delete set null,
  client_profile_id uuid not null references public.profiles(id) on delete cascade,
  lawyer_id uuid not null references public.lawyers(id) on delete restrict,
  priority public.appointment_priority not null default 'regular',
  recurring boolean not null default false,
  recurrence_group text,
  appointment_date date not null,
  start_time time not null,
  end_time time not null,
  status public.appointment_status not null default 'pending',
  conflict_flag boolean not null default false,
  conflict_reason text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint appointment_time_window check (end_time > start_time)
);

create table if not exists public.appointment_timeline (
  id uuid primary key default gen_random_uuid(),
  appointment_id uuid not null references public.appointments(id) on delete cascade,
  action text not null,
  note text,
  actor_profile_id uuid references public.profiles(id),
  created_at timestamptz not null default now()
);

create table if not exists public.lawyer_availability (
  id uuid primary key default gen_random_uuid(),
  lawyer_id uuid not null references public.lawyers(id) on delete cascade,
  availability public.availability_status not null,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  reason text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint availability_window check (ends_at > starts_at)
);

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  message text not null,
  category text not null default 'system',
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.reports (
  id uuid primary key default gen_random_uuid(),
  report_type text not null,
  payload jsonb not null,
  generated_by uuid references public.profiles(id),
  created_at timestamptz not null default now()
);

create index if not exists idx_appointments_lawyer_date on public.appointments(lawyer_id, appointment_date, start_time, end_time);
create index if not exists idx_appointments_client on public.appointments(client_profile_id);
create index if not exists idx_appointments_priority on public.appointments(priority);
create index if not exists idx_inquiries_status on public.inquiries(status);
create index if not exists idx_notifications_profile on public.notifications(profile_id, created_at desc);

alter table public.profiles enable row level security;
alter table public.lawyers enable row level security;
alter table public.clients enable row level security;
alter table public.inquiries enable row level security;
alter table public.appointments enable row level security;
alter table public.appointment_timeline enable row level security;
alter table public.lawyer_availability enable row level security;
alter table public.notifications enable row level security;
alter table public.reports enable row level security;

create or replace function public.current_user_role()
returns public.user_role
language sql
stable
as $$
  select role from public.profiles where id = auth.uid();
$$;

create policy "profiles self or staff-admin"
on public.profiles for select
using (id = auth.uid() or public.current_user_role() in ('staff', 'admin'));

create policy "clients self or staff-admin"
on public.clients for select
using (profile_id = auth.uid() or public.current_user_role() in ('staff', 'admin'));

create policy "inquiries own or operations"
on public.inquiries for all
using (client_profile_id = auth.uid() or public.current_user_role() in ('staff', 'admin'))
with check (client_profile_id = auth.uid() or public.current_user_role() in ('staff', 'admin'));

create policy "appointments by role visibility"
on public.appointments for select
using (
  client_profile_id = auth.uid()
  or public.current_user_role() in ('staff', 'admin')
  or exists (
    select 1 from public.lawyers l
    where l.id = appointments.lawyer_id and l.profile_id = auth.uid()
  )
);

create policy "appointments operations manage"
on public.appointments for all
using (public.current_user_role() in ('staff', 'admin'))
with check (public.current_user_role() in ('staff', 'admin'));

create policy "lawyer availability own or operations"
on public.lawyer_availability for all
using (
  public.current_user_role() in ('staff', 'admin')
  or exists (
    select 1 from public.lawyers l
    where l.id = lawyer_availability.lawyer_id and l.profile_id = auth.uid()
  )
)
with check (
  public.current_user_role() in ('staff', 'admin')
  or exists (
    select 1 from public.lawyers l
    where l.id = lawyer_availability.lawyer_id and l.profile_id = auth.uid()
  )
);

create policy "notifications own"
on public.notifications for select
using (profile_id = auth.uid() or public.current_user_role() in ('staff', 'admin'));

create policy "reports admin"
on public.reports for all
using (public.current_user_role() = 'admin')
with check (public.current_user_role() = 'admin');
