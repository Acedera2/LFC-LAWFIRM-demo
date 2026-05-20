-- Supabase/Postgres schema mirror for demo environment
-- Basic tables for users, lawyers, appointments, and documents
-- RLS policies are added as examples; adapt for production.

create table if not exists users (
	id uuid primary key default gen_random_uuid(),
	email text not null unique,
	name text,
	role text not null default 'client',
	created_at timestamptz default now()
);

create table if not exists lawyers (
	id uuid primary key default gen_random_uuid(),
	user_id uuid references users(id) on delete cascade,
	specialization text,
	created_at timestamptz default now()
);

create table if not exists appointments (
	id uuid primary key default gen_random_uuid(),
	client_id uuid references users(id) on delete cascade,
	lawyer_id uuid references lawyers(id),
	title text,
	status text default 'PENDING',
	scheduled_start timestamptz,
	scheduled_end timestamptz,
	created_at timestamptz default now()
);

create table if not exists documents (
	id uuid primary key default gen_random_uuid(),
	appointment_id uuid references appointments(id) on delete cascade,
	filename text,
	content_type text,
	created_at timestamptz default now()
);

-- Example: enable row level security for appointments and allow owners
-- to select/insert/update their rows. Adjust policies according to app auth.
alter table appointments enable row level security;

create policy "allow_client_select" on appointments
	for select using (client_id = current_setting('jwt.claims.user_id', true)::uuid);

create policy "allow_lawyer_select" on appointments
	for select using (lawyer_id = (
		(select id from lawyers where user_id = current_setting('jwt.claims.user_id', true)::uuid)
	));

-- Allow clients to insert their own appointments
create policy "client_insert" on appointments
	for insert with check (client_id = current_setting('jwt.claims.user_id', true)::uuid);

-- Add indexes
create index if not exists idx_appointments_client on appointments(client_id);
create index if not exists idx_appointments_lawyer on appointments(lawyer_id);

-- End of supabase schema

