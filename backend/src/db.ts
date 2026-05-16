import pg from "pg";
import { config } from "./config.js";

const getDatabaseUrl = () => {
  if (!config.databaseUrl.includes("supabase.co")) {
    return config.databaseUrl;
  }

  const url = new URL(config.databaseUrl);
  url.searchParams.delete("sslmode");
  url.searchParams.delete("sslcert");
  url.searchParams.delete("sslkey");
  url.searchParams.delete("sslrootcert");
  return url.toString();
};

const databaseUrl = getDatabaseUrl();

export const pool = new pg.Pool({
  connectionString: databaseUrl,
  ssl: databaseUrl.includes("supabase.co")
    ? { rejectUnauthorized: false }
    : undefined
});

export const query = <T extends pg.QueryResultRow = pg.QueryResultRow>(text: string, params?: unknown[]) =>
  pool.query<T>(text, params);

export const initDb = async () => {
  await query(`
    create extension if not exists "pgcrypto";

    create table if not exists users (
      id uuid primary key default gen_random_uuid(),
      name text not null,
      email text not null unique,
      password_hash text not null,
      phone text not null,
      state text not null,
      district text not null,
      language text not null default 'en',
      plan text not null default 'free',
      role text not null default 'farmer',
      farm_size text,
      main_crops text,
      created_at timestamptz not null default now(),
      updated_at timestamptz not null default now()
    );

    create table if not exists products (
      id uuid primary key default gen_random_uuid(),
      owner_id uuid references users(id) on delete set null,
      name text not null,
      price numeric(12, 2) not null,
      unit text not null default 'kg',
      quantity integer not null default 0,
      seller text not null,
      location text not null,
      description text not null default '',
      category text not null,
      freshness text not null default 'Fresh',
      is_organic boolean not null default false,
      product_type text not null default 'grocery',
      condition text,
      images jsonb not null default '[]'::jsonb,
      likes_count integer not null default 0,
      saves_count integer not null default 0,
      rating numeric(3, 2) not null default 4.0,
      created_at timestamptz not null default now(),
      updated_at timestamptz not null default now()
    );

    create table if not exists product_feedback (
      id uuid primary key default gen_random_uuid(),
      product_id uuid not null references products(id) on delete cascade,
      user_id uuid not null references users(id) on delete cascade,
      rating integer not null check (rating between 1 and 5),
      comment text not null default '',
      created_at timestamptz not null default now()
    );

    create table if not exists product_likes (
      product_id uuid not null references products(id) on delete cascade,
      user_id uuid not null references users(id) on delete cascade,
      created_at timestamptz not null default now(),
      primary key (product_id, user_id)
    );

    create table if not exists orders (
      id uuid primary key default gen_random_uuid(),
      user_id uuid not null references users(id) on delete cascade,
      items jsonb not null,
      total_amount numeric(12, 2) not null,
      status text not null default 'confirmed',
      delivery_address text not null,
      payment_method text not null default 'Cash on Delivery',
      order_type text not null default 'grocery',
      tracking_number text not null default concat('TRK', floor(random() * 1000000)::text),
      created_at timestamptz not null default now(),
      updated_at timestamptz not null default now()
    );

    create table if not exists cold_storage_requests (
      id uuid primary key default gen_random_uuid(),
      user_id uuid references users(id) on delete set null,
      farmer_name text not null,
      farm_location text not null,
      phone_number text not null,
      email text,
      farm_size text not null,
      produce_type text not null,
      estimated_quantity text not null,
      preferred_duration text not null,
      nearest_facility text,
      special_requirements text,
      status text not null default 'submitted',
      created_at timestamptz not null default now()
    );
  `);
};
