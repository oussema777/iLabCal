# Supabase Database Setup

Copy and run the following script in your Supabase **SQL Editor** to initialize the database for iLab SmartCalc.

```sql
-- 1. Global Settings
create table "GlobalSettings" (
  id bigint primary key generated always as identity,
  "filamentCostPerGram" float default 0.09,
  "elecCostPerHour" float default 0.2,
  "employeeHourlyRate" float default 6.0,
  "amortizationRate" float default 0.05,
  "vatRate" float default 0.19,
  "marginRate" float default 0.60
);
alter table "GlobalSettings" enable row level security;
create policy "Public Access" on "GlobalSettings" for all using (true);

-- 2. Cost Presets
create table "CostPreset" (
  id bigint primary key generated always as identity,
  name text not null,
  "defaultAmount" float default 0
);
alter table "CostPreset" enable row level security;
create policy "Public Access" on "CostPreset" for all using (true);

-- 3. Products
create table "Product" (
  id bigint primary key generated always as identity,
  "createdAt" timestamptz default now(),
  name text default 'Untitled Project',
  "customerName" text,
  "customerPhone" text,
  "customerAddress" text,
  "customerNotes" text,
  "filamentWeight" float not null,
  "printHours" float not null,
  "employeeHours" float not null,
  "additionalCosts" text, -- JSON string
  "totalCost" float not null,
  "finalPrice" float not null,
  "sellingPrice" float not null,
  "isValidated" boolean default false
);
alter table "Product" enable row level security;
create policy "Public Access" on "Product" for all using (true);

-- 4. Production Queue
create table "ProductionQueue" (
  id bigint primary key generated always as identity,
  "productId" bigint unique references "Product"(id) on delete cascade,
  "startTime" timestamptz not null,
  "endTime" timestamptz not null
);
alter table "ProductionQueue" enable row level security;
create policy "Public Access" on "ProductionQueue" for all using (true);
```
