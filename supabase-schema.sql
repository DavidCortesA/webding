create extension if not exists "pgcrypto";

create table public.wedding_pages (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  slug text not null unique,
  title text not null,
  template_key text not null default 'quincy_romance',
  status text not null default 'draft' check (status in ('draft', 'published')),
  custom_domain text unique,
  domain_status text not null default 'pending' check (domain_status in ('pending', 'verified', 'active', 'error')),
  dns_instructions jsonb not null default '{}'::jsonb,
  settings jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.wedding_rsvps (
  id uuid primary key default gen_random_uuid(),
  wedding_page_id uuid not null references public.wedding_pages(id) on delete cascade,
  guest_name text,
  guest_phone text,
  guests_count int not null default 1,
  message text,
  source text not null default 'whatsapp',
  created_at timestamptz not null default now()
);

create table public.wedding_guests (
  id uuid primary key default gen_random_uuid(),
  wedding_page_id uuid not null references public.wedding_pages(id) on delete cascade,
  confirmation_id text not null unique default encode(gen_random_bytes(12), 'hex'),
  family_name text not null,
  max_guests int not null default 1 check (max_guests > 0),
  phone text,
  email text,
  notes text,
  confirmation_url text,
  email_sent_at timestamptz,
  email_last_error text,
  status text not null default 'pending' check (status in ('confirmed', 'declined', 'pending')),
  confirmed_guests int not null default 0 check (confirmed_guests >= 0),
  message text,
  confirmed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint confirmed_guests_within_limit check (confirmed_guests <= max_guests)
);

create index wedding_pages_user_id_idx on public.wedding_pages(user_id);
create index wedding_pages_slug_idx on public.wedding_pages(slug);
create index wedding_pages_custom_domain_idx on public.wedding_pages(custom_domain) where custom_domain is not null;
create index wedding_rsvps_page_idx on public.wedding_rsvps(wedding_page_id);
create index wedding_guests_page_idx on public.wedding_guests(wedding_page_id);
create index wedding_guests_confirmation_idx on public.wedding_guests(confirmation_id);
create unique index wedding_guests_event_family_unique
on public.wedding_guests(wedding_page_id, lower(family_name));

alter table public.wedding_pages enable row level security;
alter table public.wedding_rsvps enable row level security;
alter table public.wedding_guests enable row level security;

create policy "Owners can read their wedding pages"
on public.wedding_pages for select
to authenticated
using (auth.uid() = user_id);

create policy "Published pages are public"
on public.wedding_pages for select
to anon, authenticated
using (status = 'published');

create policy "Owners can create wedding pages"
on public.wedding_pages for insert
to authenticated
with check (auth.uid() = user_id);

create policy "Owners can update wedding pages"
on public.wedding_pages for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "Owners can delete wedding pages"
on public.wedding_pages for delete
to authenticated
using (auth.uid() = user_id);

create policy "Anyone can create whatsapp rsvps"
on public.wedding_rsvps for insert
to anon, authenticated
with check (true);

create policy "Owners can read rsvps"
on public.wedding_rsvps for select
to authenticated
using (
  exists (
    select 1
    from public.wedding_pages
    where wedding_pages.id = wedding_rsvps.wedding_page_id
      and wedding_pages.user_id = auth.uid()
  )
);

create policy "Owners can manage wedding guests"
on public.wedding_guests for all
to authenticated
using (
  exists (
    select 1
    from public.wedding_pages
    where wedding_pages.id = wedding_guests.wedding_page_id
      and wedding_pages.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.wedding_pages
    where wedding_pages.id = wedding_guests.wedding_page_id
      and wedding_pages.user_id = auth.uid()
  )
);

create policy "Guests can read their confirmation"
on public.wedding_guests for select
to anon, authenticated
using (
  exists (
    select 1
    from public.wedding_pages
    where wedding_pages.id = wedding_guests.wedding_page_id
      and wedding_pages.status = 'published'
  )
);

create policy "Guests can update their confirmation"
on public.wedding_guests for update
to anon, authenticated
using (
  exists (
    select 1
    from public.wedding_pages
    where wedding_pages.id = wedding_guests.wedding_page_id
      and wedding_pages.status = 'published'
  )
)
with check (
  status in ('confirmed', 'declined', 'pending')
  and confirmed_guests <= max_guests
);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger set_wedding_pages_updated_at
before update on public.wedding_pages
for each row
execute function public.set_updated_at();

create trigger set_wedding_guests_updated_at
before update on public.wedding_guests
for each row
execute function public.set_updated_at();

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'wedding-images',
  'wedding-images',
  true,
  10485760,
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

create policy "Wedding images are publicly readable"
on storage.objects for select
to anon, authenticated
using (bucket_id = 'wedding-images');

create policy "Users can upload wedding images to their folder"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'wedding-images'
  and (storage.foldername(name))[1] = auth.uid()::text
);

create policy "Users can update their wedding images"
on storage.objects for update
to authenticated
using (
  bucket_id = 'wedding-images'
  and (storage.foldername(name))[1] = auth.uid()::text
)
with check (
  bucket_id = 'wedding-images'
  and (storage.foldername(name))[1] = auth.uid()::text
);

create policy "Users can delete their wedding images"
on storage.objects for delete
to authenticated
using (
  bucket_id = 'wedding-images'
  and (storage.foldername(name))[1] = auth.uid()::text
);
