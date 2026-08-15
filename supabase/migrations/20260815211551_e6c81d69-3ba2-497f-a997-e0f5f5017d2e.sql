-- Enum for user roles
create type public.app_role as enum ('admin', 'consultor');

-- Profiles table (extends auth.users)
create table public.profiles (
    id uuid primary key references auth.users(id) on delete cascade,
    email text not null,
    full_name text,
    created_at timestamptz not null default now()
);

-- User roles table (separate from profiles for security)
create table public.user_roles (
    id uuid primary key default gen_random_uuid(),
    user_id uuid references auth.users(id) on delete cascade not null,
    role app_role not null,
    unique (user_id, role)
);

-- Mobility records table
create table public.mobility_records (
    id uuid primary key default gen_random_uuid(),
    cedula text not null,
    ciudad text not null,
    estado text not null check (estado in ('aprobada', 'rechazada', 'con_deuda')),
    observaciones text,
    created_by uuid references auth.users(id) on delete set null,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

-- Indexes for common queries
create index idx_mobility_records_cedula on public.mobility_records(cedula);
create index idx_mobility_records_ciudad on public.mobility_records(ciudad);
create index idx_mobility_records_cedula_ciudad on public.mobility_records(cedula, ciudad);

-- Grants: authenticated users can read all mobility records (to perform queries)
grant select on public.mobility_records to authenticated;
grant all on public.mobility_records to service_role;

-- Profiles: users can read/update their own
grant select, insert, update on public.profiles to authenticated;
grant all on public.profiles to service_role;

-- User roles: read by authenticated users for has_role function, managed by service role
grant select on public.user_roles to authenticated;
grant all on public.user_roles to service_role;

-- Enable RLS
alter table public.profiles enable row level security;
alter table public.user_roles enable row level security;
alter table public.mobility_records enable row level security;

-- Security definer function to check roles
create or replace function public.has_role(_user_id uuid, _role app_role)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.user_roles
    where user_id = _user_id
      and role = _role
  )
$$;

-- RLS Policies

-- Profiles: users can read their own profile
 create policy "Users can read own profile"
 on public.profiles
 for select
 to authenticated
 using (auth.uid() = id);

-- Profiles: users can update their own profile
 create policy "Users can update own profile"
 on public.profiles
 for update
 to authenticated
 using (auth.uid() = id)
 with check (auth.uid() = id);

-- Profiles: admins can read all profiles
 create policy "Admins can read all profiles"
 on public.profiles
 for select
 to authenticated
 using (public.has_role(auth.uid(), 'admin'));

-- User roles: users can read their own roles
 create policy "Users can read own roles"
 on public.user_roles
 for select
 to authenticated
 using (auth.uid() = user_id);

-- Mobility records: authenticated users can read all records to perform queries
 create policy "Authenticated users can read mobility records"
 on public.mobility_records
 for select
 to authenticated
 using (true);

-- Mobility records: only admins can insert
 create policy "Admins can insert mobility records"
 on public.mobility_records
 for insert
 to authenticated
 with check (public.has_role(auth.uid(), 'admin'));

-- Mobility records: only admins can update
 create policy "Admins can update mobility records"
 on public.mobility_records
 for update
 to authenticated
 using (public.has_role(auth.uid(), 'admin'))
 with check (public.has_role(auth.uid(), 'admin'));

-- Mobility records: only admins can delete
 create policy "Admins can delete mobility records"
 on public.mobility_records
 for delete
 to authenticated
 using (public.has_role(auth.uid(), 'admin'));

-- Trigger to update updated_at
 create or replace function public.set_updated_at()
 returns trigger
 language plpgsql
 as $$
 begin
   new.updated_at = now();
   return new;
 end;
 $$;

 create trigger mobility_records_updated_at
 before update on public.mobility_records
 for each row
 execute function public.set_updated_at();

-- Seed demo data (sample records for testing)
insert into public.mobility_records (cedula, ciudad, estado, observaciones)
values
  ('1234567890', 'Bogotá', 'aprobada', 'Cliente calificado para plan pospago'),
  ('0987654321', 'Medellín', 'rechazada', 'Documentación incompleta'),
  ('1122334455', 'Cali', 'con_deuda', 'Deuda pendiente de $150.000'),
  ('6677889900', 'Barranquilla', 'aprobada', 'Aprobado sin observaciones');
